import React, { useState, useRef, useEffect } from 'react';

const Header = ({ title }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const notifications = [
    { id: 1, text: 'Hồ sơ của Nguyễn Văn A đã được cập nhật.', time: '5 phút trước' },
    { id: 2, text: 'Bác sĩ Trần Thị B đã gửi một tin nhắn mới.', time: '1 giờ trước' },
    { id: 3, text: 'Lịch hẹn của bạn vào ngày mai đã được xác nhận.', time: '3 giờ trước' },
  ];
  
  const unreadCount = notifications.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-10 flex-shrink-0">
      <div className="px-6 md:px-8 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Thông báo"
          >
            <NotificationIcon />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/4 translate-x-1/4 rounded-full ring-2 ring-white bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Thông báo</h3>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <li key={notif.id} className="border-b border-gray-100 last:border-b-0">
                    <a href="#" className="block p-3 hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-700">{notif.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="p-2 bg-gray-50 text-center">
                 <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const NotificationIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
);

export default Header;
