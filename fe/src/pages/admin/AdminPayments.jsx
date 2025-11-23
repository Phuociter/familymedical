import React, { useEffect, useState, useMemo } from 'react';
import { getPayments, deletePayment } from '../../api/AdminAPI';
import { FiTrash2, FiSearch, FiArrowUp, FiArrowDown, FiCreditCard, FiActivity, FiDollarSign } from 'react-icons/fi';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tìm kiếm và filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('paymentID');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const paymentsData = await getPayments();
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
      // Debug: Log để kiểm tra dữ liệu
      if (paymentsData && paymentsData.length > 0) {
        console.log('=== Payment Data Debug ===');
        console.log('Payment sample:', paymentsData[0]);
        console.log('Payment user:', paymentsData[0].user);
        console.log('Payment user fullName:', paymentsData[0].user?.fullName);
        console.log('Payment paymentStatus:', paymentsData[0].paymentStatus);
        console.log('========================');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPayments([]);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thanh toán này?')) return;
    try {
      await deletePayment(id);
      await loadData();
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Lỗi khi xóa');
    }
  };

  // Hàm helper để lấy tên người thanh toán
  const getUserName = (payment) => {
    if (!payment) return 'N/A';
    
    // Lấy từ user object nếu có
    if (payment.user && payment.user.fullName) {
      return payment.user.fullName;
    }
    
    return 'N/A';
  };

  // Tìm kiếm và filter
  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    
    let filtered = payments.filter((payment) => {
      const userName = getUserName(payment);
      
      const matchesSearch = 
        !searchTerm ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.paymentMethod && payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        !filterStatus ||
        (payment.paymentStatus && payment.paymentStatus.toUpperCase() === filterStatus.toUpperCase());
      
      return matchesSearch && matchesStatus;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'paymentDate') {
        aValue = a.paymentDate ? new Date(a.paymentDate) : null;
        bValue = b.paymentDate ? new Date(b.paymentDate) : null;
      }
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [payments, searchTerm, filterStatus, sortField, sortDirection]);

  // Phân trang
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusMap = {
      // Uppercase versions
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Thất bại' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Thành công' },
      // Mixed case versions (from database enum)
      Completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Thành công' },
      Failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Thất bại' },
      Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
    };
    
    // Thử tìm với giá trị gốc trước (để hỗ trợ "Completed" từ database)
    let style = statusMap[status];
    
    // Nếu không tìm thấy, thử với uppercase
    if (!style) {
      const normalizedStatus = status.toUpperCase();
      style = statusMap[normalizedStatus];
    }
    
    // Fallback về PENDING nếu không tìm thấy
    style = style || statusMap.PENDING;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-[rgb(25,118,210)] p-3 rounded-xl shadow-lg">
            <FiCreditCard className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'rgb(25, 118, 210)' }}>Quản lý Thanh toán</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <FiActivity size={16} />
              Quản lý các giao dịch thanh toán trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[rgb(25,118,210)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <FiCreditCard size={16} />
                Tổng số thanh toán
              </p>
              <p className="text-2xl font-bold text-gray-800">{filteredPayments.length}</p>
            </div>
            <div className="bg-[rgba(25,118,210,0.1)] p-2 rounded-lg">
              <FiCreditCard className="text-[rgb(25,118,210)]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <FiDollarSign size={16} />
                Tổng số tiền
              </p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <FiDollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <FiActivity size={16} />
                Đang chờ xử lý
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredPayments.filter(p => p.paymentStatus && p.paymentStatus.toUpperCase() === 'PENDING').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <FiActivity className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tìm kiếm và Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo người thanh toán..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="COMPLETED">Thành công</option>
              <option value="FAILED">Thất bại</option>
              <option value="PENDING">Chờ xử lý</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">
              ({filteredPayments.length} kết quả)
            </span>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người thanh toán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thanh toán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có thanh toán nào
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => {
                  return (
                    <tr key={payment.paymentID || payment.paymentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentID || payment.paymentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getUserName(payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(payment.paymentID || payment.paymentId)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredPayments.length)} trong tổng số {filteredPayments.length} kết quả
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border border-gray-300 rounded-lg ${
                        currentPage === page
                          ? 'bg-[rgb(25,118,210)] text-white border-[rgb(25,118,210)]'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;

