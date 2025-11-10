import React, { useState, useRef, useEffect, use } from 'react';
import { useSelector } from "react-redux";
import paymentApi from '../../api/paymentApi';
import authApi from '../../api/authApi';
const UserProfileModal = ({ isOpen, onClose, profile, onSave, userId }) => {
  if (!isOpen) return null;
  // console.log("UserProfileModal props - isOpen:", isOpen, "userId:", userId);
  // const userId = useSelector((state) => state.user.userID);
  // console.log("User ID in UserProfileModal2:", userId);
  const userID = +userId;
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  console.log("UserProfileModal - profileData:", profileData);
  const fileInputRef = useRef(null);
  const [payments, setPayments] = useState([]);
  const [PaymentType, setCheckPaymentType] = useState();
  const [checkPaymentOn, setCheckPaymentOn] = useState(false);
  const typeP = payments[0]?.packageType;
  useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await paymentApi.getPaymentsByUserId(userID);
                setPayments(data);
                
                
                if(data!=null){
                    setCheckPaymentOn(true);
                }
                else{
                    setCheckPaymentOn(false);
                    
                }
            } catch (error) {
                console.error('Lỗi khi lấy payments:', error);
            } finally {
                // setLoading(false);
            }
        };

        fetchPayments();
    }, [userID]);

//in ra loại gói đang dùng
  const changeckPaymenttypeP = (typeP) => {
    switch(typeP) {
      case "ONE_MONTH":
        return "1 Tháng";
      case "SIX_MONTHS":
        return "6 Tháng";
      case "ONE_YEAR":
        return "1 Năm";
      default:
        return "Chưa có gói sử dụng";
    }
  };

  useEffect(() => {
    const typeP = payments[0]?.packageType; // lấy gói đầu tiên
    setCheckPaymentType(changeckPaymenttypeP(typeP));
  }, [payments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileData(prev => ({ ...prev, avatar: event.target.result }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    onSave(profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData(profile);
    setIsEditing(false);
  };

  const InfoItem = ({ label, value, name }) => (
    <div>
      <label htmlFor={name} className="block text-sm text-[#6B7280]">{label}</label>
      {isEditing && name ? (
        <input
          id={name}
          type={name === 'email' ? 'email' : 'text'}
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full mt-1 px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm focus:ring-[#1a73e8] focus:border-[#1a73e8] transition"
        />
      ) : (
        <p className="font-medium text-[#1F2937] mt-1 h-9 flex items-center">{value}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1F2937]">Thông tin chủ hộ</h2>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="px-4 py-2 bg-[#1a73e8] text-white text-sm font-semibold rounded-md hover:bg-[#155ab6] transition-colors">
                  Lưu
                </button>
                <button onClick={handleCancel} className="px-4 py-2 bg-[#E5E7EB] text-[#1F2937] text-sm font-semibold rounded-md hover:bg-[#D1D5DB] transition-colors">
                  Hủy
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-[#1a73e8] text-white text-sm font-semibold rounded-md hover:bg-[#155ab6] transition-colors">
                Chỉnh sửa
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6]" aria-label="Đóng">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-6">
            <div className="relative flex-shrink-0">
              <img src={profileData.avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-[#E5E7EB]" />
              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-[#1a73e8] p-2 rounded-full text-white hover:bg-[#155ab6] transition-colors shadow-md"
                    aria-label="Change avatar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path>
                    </svg>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                </>
              )}
            </div>
            {/* //sửa lại giao diện không cho sửa email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 flex-grow w-full">
              <InfoItem label="Họ và tên:" value={profileData.fullName} name="name" />
              <InfoItem label="Email:" value={profileData.email} name="email" />
              <InfoItem label="Số điện thoại:" value={profileData.phoneNumber} name="phone" />
              <InfoItem label="CCCD:" value={profileData.cccd} name="cccd" />
              <div className="sm:col-span-2">
                <InfoItem label="Địa chỉ:" value={profileData.address} name="address" />
              </div>
              {/* cần nghiên cứu lại phần dưới////////////////////////////////////////////// */}
              <InfoItem label="Số thành viên trong GĐ:" value={profileData.memberCount} name="" />
            </div>
          </div>

          {!isEditing && checkPaymentOn && payments[0]  && (
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <h3 className="font-semibold text-lg text-[#1F2937] mb-3">Gói Đang sử dụng</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-[#6B7280]">Loại gói:</p>
                    <p className="font-medium text-[#1F2937]">{PaymentType}</p>
                </div>
                <div>
                    <p className="text-sm text-[#6B7280]">Ngày hết hạn:</p>
                    <p className="font-medium text-[#1F2937]">{payments[0].expiryDate}</p>
                </div>
              </div>
            </div>
          )}
          {payments[0]==null && (
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <h3 className="font-semibold text-lg text-[#1F2937] mb-3">Gói sử dụng: Chưa gia hạn</h3>
              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-[#6B7280]">Loại gói:</p>
                    <p className="font-medium text-[#1F2937]">{payments.packageType}</p>
                </div>
                <div>
                    <p className="text-sm text-[#6B7280]">Trạng thái:</p>
                    <p className="font-medium text-[#1F2937]">{payments.on}</p>
                </div>
                <div>
                    <p className="text-sm text-[#6B7280]">Ngày hết hạn:</p>
                    <p className="font-medium text-[#1F2937]">{payments.expiryDate}</p>
                </div>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
