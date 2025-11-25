import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Component - Hiển thị đường dẫn navigation
 * 
 * @param {Object} props
 * @param {Array} props.items - Mảng các breadcrumb items
 * @param {string} props.items[].label - Nhãn hiển thị
 * @param {string} props.items[].path - Đường dẫn (optional cho item cuối)
 * @param {boolean} props.showHome - Hiển thị icon Home (default: true)
 * @param {string} props.className - Custom className
 */
const Breadcrumb = ({ items = [], showHome = true, className = '' }) => {
  const location = useLocation();

  // Nếu không có items, tự động generate từ URL
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbsFromPath(location.pathname);

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1 text-sm ${className}`}
    >
      {showHome && (
        <>
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
            aria-label="Trang chủ"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbItems.length > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </>
      )}

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span 
                className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <>
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[150px] sm:max-w-none hover:underline"
                >
                  {item.label}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

/**
 * Generate breadcrumbs từ pathname
 */
const generateBreadcrumbsFromPath = (pathname) => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  paths.forEach((path, index) => {
    const route = '/' + paths.slice(0, index + 1).join('/');
    const label = formatPathLabel(path);
    
    breadcrumbs.push({
      label,
      path: route
    });
  });

  return breadcrumbs;
};

/**
 * Format path thành label dễ đọc
 */
const formatPathLabel = (path) => {
  // Xử lý các trường hợp đặc biệt
  const labelMap = {
    'doctor': 'Bác sĩ',
    'families': 'Gia đình',
    'patients': 'Bệnh nhân',
    'requests': 'Yêu cầu',
    'dashboard': 'Tổng quan',
    'profile': 'Hồ sơ',
    'settings': 'Cài đặt'
  };

  if (labelMap[path.toLowerCase()]) {
    return labelMap[path.toLowerCase()];
  }

  // Nếu là ID (số hoặc UUID), giữ nguyên
  if (/^[0-9a-f-]+$/i.test(path)) {
    return path;
  }

  // Capitalize first letter
  return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
};

export default Breadcrumb;
