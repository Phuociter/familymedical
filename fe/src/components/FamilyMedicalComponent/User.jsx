import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaUserMd, FaSignOutAlt } from "react-icons/fa";

export default function UserMenu({ OpenStatus }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Nút USER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <span className="font-bold text-lg uppercase tracking-wide">USER</span>
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-black/50">
          <svg
            className="w-6 h-6 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <a
              href="#thong-tin-ca-nhan"
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FaUser className="mr-3 text-gray-500" />
              Thông tin cá nhân
            </a>

            <a
              href="#bac-si-gia-dinh"
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FaUserMd className="mr-3 text-gray-500" />
              Thông tin bác sĩ gia đình
            </a>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={() => alert("Đang đăng xuất...")}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700"
            >
              <FaSignOutAlt className="mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
