import React from 'react';
import { useMomoPayment } from '../../hooks/payment/useMomoPayment';

const SubscriptionModal = ({ isOpen, onClose }) => {
  const { loading, error, packages, initiateMomoPayment } = useMomoPayment();

  if (!isOpen) return null;

  const PackageCard = ({ pkg, onClick, disabled }) => (
    <button
      onClick={() => onClick(pkg)}
      disabled={disabled}
      className="w-full p-6 text-center border-2 border-[#E5E7EB] rounded-lg hover:border-[#1a73e8] hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <p className="text-xl font-bold text-[#1F2937]">{pkg.duration}</p>
      <p className="mt-2 text-lg font-semibold text-[#1a73e8]">{pkg.price}</p>
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 text-center text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-4 p-3 text-center text-sm text-blue-700 bg-blue-100 rounded-lg" role="alert">
              Đang xử lý, vui lòng chờ...
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg.packageType} pkg={pkg} onClick={initiateMomoPayment} disabled={loading} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
