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
    <header className="bg-[#FFFFFF] shadow-sm border-b border-[#EEEEEE] z-10 flex-shrink-0">
      <div className="px-6 md:px-8 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#111827]">{title}</h2>
        <div className="relative" ref={notificationRef}>
          {/* <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 rounded-full text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6]"
            aria-label="Thông báo"
          >
            <NotificationIcon />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/4 translate-x-1/4 rounded-full ring-2 ring-[#FFFFFF] bg-[#EF4444] text-[#FFFFFF] text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button> */}
          {/* {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFFFF] rounded-lg shadow-xl overflow-hidden border border-[#EEEEEE]">
              <div className="p-3 border-b border-[#EEEEEE]">
                <h3 className="font-semibold text-[#111827]">Thông báo</h3>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <li key={notif.id} className="border-b border-[#F3F4F6] last:border-b-0">
                    <a href="#" className="block p-3 hover:bg-[#F9FAFB] transition-colors">
                      <p className="text-sm text-[#374151]">{notif.text}</p>
                      <p className="text-xs text-[#9CA3AF] mt-1">{notif.time}</p>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="p-2 bg-[#F3F4F6] text-center">
                 <a href="#" className="text-sm font-medium text-[#3B82F6] hover:underline">Xem tất cả</a>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </header>
  );
};

const NotificationIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
    </svg>
);

export default Header;
