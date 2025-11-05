import React from 'react';

const SubscriptionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const PackageCard = ({ duration, price }) => (
    <button className="w-full p-6 text-center border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
      <p className="text-xl font-bold text-gray-800">{duration}</p>
      <p className="mt-2 text-lg font-semibold text-blue-600">{price}</p>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Chọn gói sử dụng</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200" aria-label="Đóng">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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
