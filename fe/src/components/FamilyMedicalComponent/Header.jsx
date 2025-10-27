import { Link, useNavigate } from "react-router-dom";
import { useState,useRef,useEffect } from "react";
import doctorImage from "../../assets/images/doctor_consultation.png";
import notiImage from "../../assets/images/notification.png";
import notiImage2 from "../../assets/images/notification2.png";
import searchIcon from "../../assets/images/search.png";
import UserMenu from "./User";



export default function Header({ onAddFamily }) {
  const [openNotify, setOpenNotify] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);



  const handleClickOutside = (event) => {
    // Nếu menu đang mở và người dùng click *bên ngoài* menu
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false); // Đóng menu
    }
  };

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
    <header className="w-full bg-blue shadow-md flex items-center justify-between px-6 py-3">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img
          src={doctorImage}
          alt="logo"
          className="w-6 h-6"
        />
        <h1 className="text-xl font-semibold text-white">
          Quản lý hồ sơ y tế gia đình
        </h1>
      </div>

      {/* search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm hồ sơ y tế..."
            className="w-full rounded-full px-4 py-2 pl-10 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <img
            src={searchIcon}
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          >
          </img>
        </div>
      </div>

      {/*notification + user */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <button onClick={() => setOpenNotify(!openNotify)} className="relative transition-transform duration-200 hover:scale-110  hover:brightness-110">
          <img
            src={openNotify ? notiImage2 :notiImage}
            alt="bell"
            className="w-6 h-6"
          />
          {/* Chấm đỏ hiển thị số thông báo */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-[#ff0000] text-sm w-4 h-4 flex items-center justify-center rounded-full">
            1
          </span>
        </button>
        {/* Dropdown danh sách thông báo */}
          {openNotify && (
          <div className='absolute right-0 border-b top-10 w-72 text-white rounded shadow-xl'>
            <div className='p-3 bg-[#1a1a1a] border-b font-semibold'>Thông báo</div>
            <ul className='max-h-64 overflow-y-auto'>
              {/* {notifications.map((item) => (
                <li
                  key={item.notificationId}
                  className='flex justify-between items-center px-4 py-2 bg-[#1a1a1a] text-sm hover:text-[#65b0f6] hover:bg-[#2a2a2a]'
                >
                  <span      
                    className="cursor-pointer hover:underline"
                    onClick={() => handleNotificationClick(item.type)}
                  >
                  {item.content}
                  </span>
                  <button
                    className='text-red-500 hover:underline text-xs ml-2'
                    onClick={() => handleDeleteNotification(item.notificationId)}
                  >
                    Xóa
                  </button>
                </li>
              ))} */}
              {
                <li
                  key={1}
                  className='flex justify-between items-center px-4 py-2 bg-[#1a1a1a] text-sm hover:text-[#65b0f6] hover:bg-[#2a2a2a]'
                >
                  <span      
                    className="cursor-pointer hover:underline"
                    // onClick={() => handleNotificationClick(item.type)}
                  >
                  demo
                  </span>
                  <button
                    className='text-red-500 hover:underline text-xs ml-2'
                    // onClick={() => handleDeleteNotification(item.notificationId)}
                  >
                    Xóa
                  </button>
                </li>
              }
            </ul>
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-2">
          <button>
            <span className="text-sm font-medium text-white">USER</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
              alt="user"
              className="w-8 h-8 rounded-full border"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
