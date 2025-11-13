import React, { useState, useRef, useEffect } from 'react';
import { View } from '../../type.js';
import { useAuth } from '../../hooks/auth/useAuth.js';
import { useSelector } from 'react-redux';
const NavItem = ({ view, activeView, setActiveView, icon, label }) => {
  const isActive = activeView === view;
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setActiveView(view);
      }}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-[#1a73e8] text-[#FFFFFF]'
          : 'text-[#D1D5DB] hover:bg-[#374151] hover:text-[#FFFFFF]'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </a>
  );
};

const Logo = () => (
    <div className="p-2 bg-[#1a73e8] rounded-lg">
      <svg className="w-8 h-8 text-[#FFFFFF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9.5L12 4L21 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 13V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 14H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
);

const Sidebar = ({ activeView, setActiveView, onOpenUserProfile, onOpenFamilyDoctorInfo, onOpenSubscription, userAvatar, userName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { logout } = useAuth();
  const user = useSelector((state) => state.user.user);
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col w-64 bg-[#1F2937] text-[#FFFFFF]">
      <div className="flex items-center justify-center h-20 border-b border-[#374151]">
        <Logo />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem
          view={View.Family}
          activeView={activeView}
          setActiveView={setActiveView}
          icon={<FamilyIcon />}
          label="Thành viên gia đình"
        />
        <NavItem
          view={View.Doctors}
          activeView={activeView}
          setActiveView={setActiveView}
          icon={<DoctorIcon />}
          label="Danh sách Bác sĩ"
        />
        <NavItem
          view={View.Messages}
          activeView={activeView}
          setActiveView={setActiveView}
          icon={<MessageIcon />}
          label="Tin nhắn"
        />
      </nav>
      <div ref={menuRef} className="relative px-4 py-4 border-t border-[#374151]">
        {isMenuOpen && (
           <div className="absolute bottom-full left-0 mb-2 w-full px-4">
                <div className="bg-[#FFFFFF] rounded-md shadow-lg py-2 text-[#1F2937] ring-1 ring-black ring-opacity-5">
                    <button onClick={() => { onOpenUserProfile(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-[#F3F4F6]">
                        <ProfileIcon />
                        <span className="ml-3">Thông tin cá nhân</span>
                    </button>
                    <button onClick={() => { onOpenFamilyDoctorInfo(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-[#F3F4F6]">
                        <FamilyDoctorIcon />
                        <span className="ml-3">Thông tin bác sĩ gia đình</span>
                    </button>
                    <button onClick={() => { onOpenSubscription(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-[#F3F4F6]">
                        <PaymentIcon />
                        <span className="ml-3">Đăng ký gói pro</span>
                    </button>
                    <div className="border-t border-[#E5E7EB] my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-[#F3F4F6]">
                        <LogoutIcon />
                        <span className="ml-3">Đăng xuất</span>
                    </button>
                </div>
           </div>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center w-full text-left rounded-md p-2 hover:bg-[#374151] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1F2937] focus:ring-[#FFFFFF]"
        >
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={user.avatarUrl}
            alt="User avatar"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-[#FFFFFF]">{user.fullName}</p>
          </div>
        </button>
      </div>
    </div>
  );
};

// SVG Icons (giữ nguyên)
const FamilyIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.176-5.97M15 21h6m-6-1a6 6 0 00-6-6m6 6v1m0-1a6 6 0 016 6m-6-6v1"></path></svg>
);
const DoctorIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100-4m0 4a2 2 0 110-4m-6 0a2 2 0 100-4m0 4a2 2 0 110-4M6 18v-2a2 2 0 114 0v2m-4 0h4m8 0v-2a2 2 0 10-4 0v2m4 0h-4"></path></svg>
);
const MessageIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
);

// Dropdown Menu Icons
const ProfileIcon = () => (
    <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
);
const FamilyDoctorIcon = () => (
    <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.455-1.95A5.008 5.008 0 0110 14c-1.657 0-3 .895-3 2s1.343 2 3 2m0-8a3 3 0 100-6 3 3 0 000 6z"></path></svg>
);
const PaymentIcon = () => (
    <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
);
const LogoutIcon = () => (
    <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

export default Sidebar;
