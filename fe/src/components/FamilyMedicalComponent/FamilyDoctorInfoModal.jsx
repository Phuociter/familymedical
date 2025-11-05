import React from 'react';

const FamilyDoctorInfoModal = ({ isOpen, onClose, doctor, onTerminateContract }) => {
  if (!isOpen) return null;

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || 'Chưa có'}</p>
    </div>
  );
  
  const contract = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Pending'
  };

  const handleScheduleRequest = () => {
    alert('Đã gửi yêu cầu đặt lịch thành công tới bác sĩ.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Thông tin bác sĩ gia đình</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200" aria-label="Đóng">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6">
          {doctor ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                <InfoItem label="Họ và tên:" value={doctor.name} />
                <InfoItem label="Email:" value={doctor.email} />
                <InfoItem label="Mã bác sĩ:" value={`BS${doctor.id.toString().padStart(4, '0')}`} />
                <InfoItem label="CCCD:" value={'Chưa có'} />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Thông tin phân công</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                    <li><strong>Ngày bắt đầu:</strong> {contract.startDate}</li>
                    <li><strong>Ngày kết thúc:</strong> {contract.endDate}</li>
                    <li><strong>Trạng thái yêu cầu:</strong> <span className="font-medium text-yellow-600">{contract.status}</span></li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
                <p className="text-gray-500">Chưa có bác sĩ gia đình nào được phân công.</p>
            </div>
          )}
        </div>
        
        {doctor && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-3">
                    <a 
                        href={doctor.zaloLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Liên hệ qua Zalo
                    </a>
                    <button
                        onClick={handleScheduleRequest}
                        className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
                    >
                        Gửi yêu cầu đặt lịch
                    </button>
                    <button
                        onClick={onTerminateContract}
                        className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
                    >
                        Chấm dứt hợp đồng
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDoctorInfoModal;
