import React from 'react';
import { useMomoCallback } from '../hooks/payment/useMomoCallback';

const MomoCallbackPage = () => {
  const { paymentStatusMessage, isError, loading, navigateToRoleBasedDashboard } = useMomoCallback();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgColor py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-primary p-10 rounded-xl shadow-xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-ascent-1">
          Kết quả thanh toán MoMo
        </h2>
        {loading ? (
          <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg" role="alert">
            {paymentStatusMessage}
          </div>
        ) : (
          <div className={`p-3 mb-4 text-sm rounded-lg ${isError ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`} role="alert">
            {paymentStatusMessage}
          </div>
        )}
        <button
          onClick={navigateToRoleBasedDashboard}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
        >
          Quay về trang của bạn
        </button>
      </div>
    </div>
  );
};

export default MomoCallbackPage;