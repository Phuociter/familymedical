import React, { useEffect, useMemo, useState } from 'react';
import ActionAlert from '../ActionAlert';
import authApi from '../../api/authApi';
import MemberAPI from '../../api/MemberAPI';
import DoctorAPI from '../../api/DoctorAPI';

const FamilyDoctorInfoModal = ({ isOpen, onClose }) => {
  const [requestInfo, setRequestInfo] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState({ open: false, message: '' });
  const user = JSON.parse(localStorage.getItem('user'));
  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="font-medium text-[#111827]">{value || 'Chưa cập nhật'}</p>
    </div>
  );

  const showAlert = (message) => {
    setAlertState({ open: true, message });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (err) {
      console.error('Không thể đọc thông tin người dùng từ localStorage:', err);
      return null;
    }
  };

  const resolveFamilyId = async (token) => {
    const storedUser = getStoredUser();
    const localFamilyId = storedUser?.familyID ?? storedUser?.familyId;
    if (localFamilyId) {
      return localFamilyId;
    }
    if (storedUser?.userID) {
      try {
        const family = await MemberAPI.getFamilyByHeadOfFamilyID(user.userID, token);
        return family?.familyID;
      } catch (err) {
        console.error('Không thể lấy familyID từ API:', err);
      }
    }
    return null;
  };



  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Vui lòng đăng nhập lại để xem thông tin bác sĩ.');
        return;
      }

      setLoading(true);
      setError('');
      setDoctorInfo(null);
      setRequestInfo(null);

      try {
        const familyId = await resolveFamilyId(token);
        
        if (!familyId) {
          setError('Không tìm thấy thông tin gia đình.');
          showAlert('Hiện chưa có bác sĩ gia đình.');
          return;
        }

        const request = await DoctorAPI.getDoctorRequestByFamilyID(familyId, token);
        // console.log('Fetched doctor request:', request);
        setRequestInfo(request);

        if (!request) {
          showAlert('Hiện chưa có bác sĩ gia đình.');
          return;
        }

        const normalizedStatus = (request.status || '').toUpperCase();
        const doctor = await DoctorAPI.getDoctorInfoById(request.doctor.userID, token);
        console.log('Fetched doctor info:', doctor);
        setDoctorInfo(doctor);

        if (normalizedStatus === 'PENDING') {
          const doctorName = doctor?.fullName || 'bác sĩ đã chọn';
          showAlert(`Yêu cầu gửi tới bác sĩ "${doctorName}" đang đợi chấp nhận.`);
          return;
        }

        if (normalizedStatus === 'REJECTED') {
          showAlert('Hiện chưa có bác sĩ gia đình.');
          return;
        }

        hideAlert();
      } catch (err) {
        console.error('Không thể tải thông tin bác sĩ gia đình:', err);
        setError('Không thể tải thông tin bác sĩ gia đình. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  const handleScheduleRequest = () => {
    alert('Đã gửi yêu cầu đặt lịch thành công tới bác sĩ.');
  };

  const onTerminateContract = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Vui lòng đăng nhập lại để thực hiện hành động này.');
      return;
    }

    try {
      console.log('requestInfo:', requestInfo); 
      await DoctorAPI.deleteDoctorRequest(requestInfo.requestID, token);
      alert('Hợp đồng với bác sĩ gia đình đã được chấm dứt.');
      onClose();
    } catch (error) {
      console.error('Lỗi khi chấm dứt hợp đồng:', error);
      alert('Không thể chấm dứt hợp đồng. Vui lòng thử lại sau.');
    }
  }

  const normalizedStatus = useMemo(() => (requestInfo?.status || '').toUpperCase(), [requestInfo]);
  const formattedStartDate = useMemo(() => {
    if (!requestInfo?.requestDate) return 'Chưa cập nhật';
    try {
      return new Date(requestInfo.requestDate).toLocaleDateString('vi-VN');
    } catch (err) {
      return requestInfo.requestDate;
    }
  }, [requestInfo]);

  const shouldShowDoctorDetails = normalizedStatus === 'ACCEPTED' && doctorInfo;
  // console.log('Rendering FamilyDoctorInfoModal with state:',doctorInfo);

  if (!isOpen) {
    return (
      <ActionAlert isOpen={alertState.open} onClose={hideAlert}>
        {alertState.message}
      </ActionAlert>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-[#000000] bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#EEEEEE] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#111827]">Thông tin bác sĩ gia đình</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#9CA3AF] hover:bg-[#E5E7EB]"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 min-h-[220px]">
          {loading ? (
            <div className="text-center py-10 text-[#6B7280]">Đang tải thông tin bác sĩ...</div>
          ) : error ? (
            <div className="text-center py-10 text-[#EF4444]">{error}</div>
          ) : shouldShowDoctorDetails ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                <InfoItem label="Họ và tên" value={doctorInfo?.fullName} />
                <InfoItem label="Email" value={doctorInfo?.email} />
                <InfoItem label="Mã bác sĩ" value={doctorInfo?.doctorCode || doctorInfo?.userID} />
                <InfoItem label="Số điện thoại" value={doctorInfo?.phoneNumber} />
              </div>

              <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#EEEEEE]">
                <h3 className="font-semibold text-lg text-[#111827] mb-3">Thông tin phân công</h3>
                <ul className="space-y-2 list-disc list-inside text-[#374151]">
                  <li>
                    <strong>Ngày bắt đầu:</strong> {formattedStartDate}
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-[#6B7280]">
                {normalizedStatus === 'PENDING'
                  ? 'Yêu cầu của bạn đang được chờ bác sĩ phản hồi.'
                  : 'Chưa có bác sĩ gia đình nào được phân công.'}
              </p>
            </div>
          )}
        </div>
        
        {shouldShowDoctorDetails && (
          <div className="p-6 border-t border-[#EEEEEE] bg-[#F9FAFB]">
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href={`https://zalo.me/${doctorInfo.phoneNumber}` || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 text-center px-4 py-2 bg-[#3B82F6] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#2563EB] transition-colors"
              >
                Liên hệ qua Zalo
              </a>
              <button
                onClick={handleScheduleRequest}
                className="flex-1 px-4 py-2 bg-[#10B981] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#059669] transition-colors"
              >
                Gửi yêu cầu đặt lịch
              </button>
              <button
                onClick={onTerminateContract}
                className="flex-1 px-4 py-2 bg-[#EF4444] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#DC2626] transition-colors"
              >
                Chấm dứt hợp đồng
              </button>
            </div>
          </div>
        )}
      </div>
      <ActionAlert isOpen={alertState.open} onClose={hideAlert}>
        {alertState.message}
      </ActionAlert>
    </div>
  );
};

export default FamilyDoctorInfoModal;
