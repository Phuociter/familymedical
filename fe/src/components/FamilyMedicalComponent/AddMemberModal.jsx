import React, { useState, useEffect } from 'react';
import MemberAPI from '../../api/MemberAPI.js'
import ActionAlert from '../ActionAlert.jsx';

const AddMemberModal = ({ isOpen, onClose, onSave }) => {
  const token = localStorage.getItem('userToken');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!isOpen) return null;
  // console.log(user);

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    cccd: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // alert
  const [message, setMessage] = useState("");
  const [isOpenAlert, setIsOpenAlert] = useState(false);
    useEffect(() => {
      if (!isOpen) {
        setFormData({
          name: '',
          relationship: '',
          dateOfBirth: '',
          gender: '',
          cccd: '',
          phoneNumber: '',
        });
        setError('');
        setIsSaving(false);
      }
  }, [isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    const response = await MemberAPI.getFamilyByHeadOfFamilyID(user.userID, token);

    const familyId = response.familyID; 
    if (
      !formData.name.trim() ||
      !formData.relationship.trim() ||
      !formData.dateOfBirth ||
      !formData.gender
    ) {
      setError('Họ và tên, Mối quan hệ, Ngày sinh và Giới tính là bắt buộc.');
      return;
    }

      setError('');
      setIsSaving(true);
      try {
        const memberDataToSend = {
          familyID: parseInt(familyId),
          relationship: formData.relationship.trim(),
          familyId:user.familyId,
          fullName: formData.name.trim(),
          ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
          ...(formData.gender && { gender: formData.gender }),
          ...(formData.phoneNumber.trim() && { phoneNumber: formData.phoneNumber.trim() }),
          ...(formData.cccd.trim() && { cccd: formData.cccd.trim() }),
        };
        await onSave(memberDataToSend);
        onClose(); 
      } catch (err) {
        console.error(err);
      } finally {
        showAlert("Thêm thành viên mới thành công")
        setIsSaving(false);
      }
  };

  const showAlert = (content) => {
    setMessage(content);
    setIsOpenAlert(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Thêm thành viên mới</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200" aria-label="Đóng">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">Mối quan hệ <span className="text-red-500">*</span></label>
              <select
                id="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              >
                <option value="">-- Chọn mối quan hệ --</option>
                <option value="Bố">Bố</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Vợ">Vợ</option>
                <option value="Con">Con</option>
                <option value="Chồng">Chồng</option>
              </select>  
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Ngày sinh</label>
              <input
                type="date"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Giới tính</label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="cccd" className="block text-sm font-medium text-gray-700">CCCD</label>
            <input
              type="text"
              id="cccd"
              value={formData.cccd}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="026436548619"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="0987654321"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 flex-shrink-0"> 
            <button onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-[#EEEEEE] text-[#424242] text-sm font-semibold rounded-md hover:bg-[#E0E0E0] transition-colors disabled:opacity-50">
              Hủy
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#1E88E5]  text-white text-sm font-semibold rounded-md hover:bg-[#1976D2]  transition-colors disabled:bg-[#42A5F5]  disabled:cursor-not-allowed">
              Lưu thành viên
            </button>
        </div>
      </div>
      <ActionAlert 
        isOpen={isOpenAlert} 
        onClose={() => setIsOpenAlert(false)}
      >
        {message}
      </ActionAlert>
    </div>
  );
};

export default AddMemberModal;