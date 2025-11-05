import React from 'react';

const SubscriptionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const PackageCard = ({ duration, price }) => (
    <button className="w-full p-6 text-center border-2 border-[#E5E7EB] rounded-lg hover:border-[#1a73e8] hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] transition-all duration-200">
      <p className="text-xl font-bold text-[#1F2937]">{duration}</p>
      <p className="mt-2 text-lg font-semibold text-[#1a73e8]">{price}</p>
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1F2937]">Chọn gói sử dụng</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6]"
            aria-label="Đóng"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PackageCard duration="1 tháng" price="100.000đ" />
            <PackageCard duration="6 tháng" price="500.000đ" />
            <PackageCard duration="1 năm" price="900.000đ" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
