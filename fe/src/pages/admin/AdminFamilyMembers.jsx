import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMembers, getFamilies, updateMember, uploadFiles, getMemberFiles, updateMedicalRecord, deleteFile, createMember, deleteMember } from '../../api/AdminAPI';
import { FiEdit, FiSave, FiX, FiFileText, FiUpload, FiArrowLeft, FiUsers, FiPlus, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { validators } from '../../utils/validation';

const AdminFamilyMembers = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingFamilyMemberId, setEditingFamilyMemberId] = useState(null);
  const [editFamilyMemberForm, setEditFamilyMemberForm] = useState({});
  const [editFamilyMemberErrors, setEditFamilyMemberErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [showMedicalRecordsModal, setShowMedicalRecordsModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editRecordForm, setEditRecordForm] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    cccd: '',
    relationship: '',
    gender: ''
  });
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    if (familyId) {
      loadFamilyData();
    }
  }, [familyId]);

  const loadFamilyData = async () => {
    setLoading(true);
    try {
      const [members, families] = await Promise.all([
        getMembers(),
        getFamilies()
      ]);

      // Lọc members của gia đình này
      const membersOfFamily = members.filter(m => m.familyID === parseInt(familyId));
      setFamilyMembers(membersOfFamily);

      // Tìm tên gia đình
      const family = families.find(f => f.familyID === parseInt(familyId));
      if (family) {
        setFamilyName(family.familyName || `Gia đình #${familyId}`);
      } else {
        setFamilyName(`Gia đình #${familyId}`);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
      alert('Lỗi khi tải dữ liệu gia đình');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFamilyMember = (member) => {
    setEditingFamilyMemberId(member.memberID);
    // Map gender từ backend (Male/Female/Other) về tiếng Việt có dấu cho form
    let genderForForm = member.gender || '';
    if (genderForForm) {
      const genderMapToVietnamese = {
        'Male': 'Nam',
        'Female': 'Nữ',
        'Other': 'Khác'
      };
      genderForForm = genderMapToVietnamese[genderForForm] || genderForForm;
    }
    setEditFamilyMemberForm({
      fullName: member.fullName || '',
      phoneNumber: member.phoneNumber || '',
      dateOfBirth: member.dateOfBirth || '',
      cccd: member.cccd || '',
      relationship: member.relationship || '',
      gender: genderForForm
    });
    setEditFamilyMemberErrors({});
  };

  const validateFamilyMemberForm = () => {
    const errors = {};
    if (editFamilyMemberForm.phoneNumber) {
      const phoneError = validators.phone(editFamilyMemberForm.phoneNumber);
      if (phoneError) errors.phoneNumber = phoneError;
    }
    if (editFamilyMemberForm.cccd) {
      const cccdError = validators.cccd(editFamilyMemberForm.cccd);
      if (cccdError) errors.cccd = cccdError;
    }
    if (editFamilyMemberForm.dateOfBirth) {
      const dateError = validators.date(editFamilyMemberForm.dateOfBirth);
      if (dateError) errors.dateOfBirth = dateError;
    }
    if (editFamilyMemberForm.fullName) {
      const nameError = validators.minLength(editFamilyMemberForm.fullName, 2, 'Họ tên');
      if (nameError) errors.fullName = nameError;
    }
    setEditFamilyMemberErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveFamilyMember = async (id) => {
    if (!validateFamilyMemberForm()) {
      alert('Vui lòng sửa các lỗi trước khi lưu');
      return;
    }
    try {
      // Map gender từ tiếng Việt có dấu sang GraphQL enum (Male, Female, Other)
      const updateData = { ...editFamilyMemberForm };
      if (updateData.gender) {
        const genderMap = {
          'Nam': 'Male',
          'Nữ': 'Female',
          'Khác': 'Other'
        };
        updateData.gender = genderMap[updateData.gender] || updateData.gender;
      }
      
      await updateMember(id, updateData);
      await loadFamilyData();
      setEditingFamilyMemberId(null);
      setEditFamilyMemberErrors({});
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating family member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi cập nhật';
      alert(errorMessage);
    }
  };

  const validateCreateForm = () => {
    const errors = {};
    
    if (newMember.fullName) {
      const nameError = validators.minLength(newMember.fullName, 2, 'Họ tên');
      if (nameError) errors.fullName = nameError;
    }
    
    if (newMember.phoneNumber) {
      const phoneError = validators.phone(newMember.phoneNumber);
      if (phoneError) errors.phoneNumber = phoneError;
    }
    
    if (newMember.cccd) {
      const cccdError = validators.cccd(newMember.cccd);
      if (cccdError) errors.cccd = cccdError;
    }
    
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateMember = async () => {
    if (!validateCreateForm()) {
      alert('Vui lòng sửa các lỗi trước khi tạo');
      return;
    }
    try {
      // Map gender từ tiếng Việt có dấu sang GraphQL enum (Male, Female, Other)
      let genderValue = null;
      if (newMember.gender) {
        const genderMap = {
          'Nam': 'Male',
          'Nữ': 'Female',
          'Khác': 'Other'
        };
        genderValue = genderMap[newMember.gender] || newMember.gender;
      }
      
      const memberData = {
        familyID: parseInt(familyId),
        fullName: newMember.fullName || null,
        phoneNumber: newMember.phoneNumber || null,
        dateOfBirth: newMember.dateOfBirth || null,
        cccd: newMember.cccd || null,
        relationship: newMember.relationship || null,
        gender: genderValue
      };
      await createMember(memberData);
      await loadFamilyData();
      setShowCreateModal(false);
      setNewMember({
        fullName: '',
        phoneNumber: '',
        dateOfBirth: '',
        cccd: '',
        relationship: '',
        gender: ''
      });
      setCreateErrors({});
      alert('Thêm thành viên thành công!');
    } catch (error) {
      console.error('Error creating member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi thêm thành viên';
      alert(errorMessage);
    }
  };

  const handleFileUpload = async (memberId, files) => {
    setUploadingFiles(prev => ({ ...prev, [memberId]: true }));
    try {
      await uploadFiles(memberId, files);
      if (showMedicalRecordsModal && selectedMemberId === memberId) {
        await loadMedicalRecords(memberId);
      }
      alert('Tải lên thành công!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Lỗi khi tải lên file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleViewMedicalRecords = async (member) => {
    if (!member || !member.memberID) {
      alert('Lỗi: Không tìm thấy thông tin bệnh nhân');
      return;
    }
    
    setSelectedMemberId(member.memberID);
    setSelectedMemberName(member.fullName || 'Bệnh nhân');
    setLoadingRecords(true);
    setMedicalRecords([]);
    setShowMedicalRecordsModal(true);
    await loadMedicalRecords(member.memberID);
  };

  const loadMedicalRecords = async (memberId) => {
    try {
      const records = await getMemberFiles(memberId);
      setMedicalRecords(records || []);
    } catch (error) {
      console.error('Error loading medical records:', error);
      alert('Lỗi khi tải bệnh án');
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecordId(record.recordID);
    setEditRecordForm({
      symptoms: record.symptoms || '',
      diagnosis: record.diagnosis || '',
      treatmentPlan: record.treatmentPlan || ''
    });
  };

  const handleSaveRecord = async (recordId) => {
    try {
      await updateMedicalRecord(recordId, editRecordForm);
      await loadMedicalRecords(selectedMemberId);
      setEditingRecordId(null);
      setEditRecordForm({});
      alert('Cập nhật bệnh án thành công!');
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Lỗi khi cập nhật bệnh án');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bệnh án này?')) {
      return;
    }
    try {
      await deleteFile(recordId);
      await loadMedicalRecords(selectedMemberId);
      alert('Xóa bệnh án thành công!');
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Lỗi khi xóa bệnh án');
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${memberName || 'này'}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await deleteMember(memberId);
      await loadFamilyData();
      alert('Xóa thành viên thành công!');
    } catch (error) {
      console.error('Error deleting member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi xóa thành viên';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/members')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="Quay lại"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FiUsers size={32} />
              Thành viên gia đình: {familyName}
            </h1>
            <p className="text-gray-500 mt-1">Tổng số thành viên: {familyMembers.length}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-100 text-black px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2 transition-colors whitespace-nowrap border border-blue-300"
        >
          <FiPlus size={20} />
          <span>Thêm thành viên</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {familyMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <FiUsers size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">Chưa có thành viên nào trong gia đình này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CCCD</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mối quan hệ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giới tính</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {familyMembers.map((member) => (
                  <tr key={member.memberID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{member.memberID}</td>
                    <td className="px-4 py-3">
                      {editingFamilyMemberId === member.memberID ? (
                        <>
                          <input
                            type="text"
                            value={editFamilyMemberForm.fullName}
                            onChange={(e) => {
                              setEditFamilyMemberForm({ ...editFamilyMemberForm, fullName: e.target.value });
                              if (editFamilyMemberErrors.fullName) {
                                setEditFamilyMemberErrors({ ...editFamilyMemberErrors, fullName: null });
                              }
                            }}
                            className={`border rounded px-2 py-1 w-full text-sm ${
                              editFamilyMemberErrors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {editFamilyMemberErrors.fullName && (
                            <p className="text-red-500 text-xs mt-1">{editFamilyMemberErrors.fullName}</p>
                          )}
                        </>
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {member.fullName || 'N/A'}
                          {member.relationship === 'Chủ hộ' && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Chủ hộ</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingFamilyMemberId === member.memberID ? (
                        <>
                          <input
                            type="text"
                            value={editFamilyMemberForm.phoneNumber}
                            onChange={(e) => {
                              setEditFamilyMemberForm({ ...editFamilyMemberForm, phoneNumber: e.target.value });
                              if (editFamilyMemberErrors.phoneNumber) {
                                setEditFamilyMemberErrors({ ...editFamilyMemberErrors, phoneNumber: null });
                              }
                            }}
                            className={`border rounded px-2 py-1 w-full text-sm ${
                              editFamilyMemberErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {editFamilyMemberErrors.phoneNumber && (
                            <p className="text-red-500 text-xs mt-1">{editFamilyMemberErrors.phoneNumber}</p>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-900">{member.phoneNumber || 'N/A'}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingFamilyMemberId === member.memberID ? (
                        <>
                          <input
                            type="date"
                            value={editFamilyMemberForm.dateOfBirth}
                            onChange={(e) => {
                              setEditFamilyMemberForm({ ...editFamilyMemberForm, dateOfBirth: e.target.value });
                              if (editFamilyMemberErrors.dateOfBirth) {
                                setEditFamilyMemberErrors({ ...editFamilyMemberErrors, dateOfBirth: null });
                              }
                            }}
                            className={`border rounded px-2 py-1 w-full text-sm ${
                              editFamilyMemberErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {editFamilyMemberErrors.dateOfBirth && (
                            <p className="text-red-500 text-xs mt-1">{editFamilyMemberErrors.dateOfBirth}</p>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingFamilyMemberId === member.memberID ? (
                        <>
                          <input
                            type="text"
                            value={editFamilyMemberForm.cccd}
                            onChange={(e) => {
                              setEditFamilyMemberForm({ ...editFamilyMemberForm, cccd: e.target.value });
                              if (editFamilyMemberErrors.cccd) {
                                setEditFamilyMemberErrors({ ...editFamilyMemberErrors, cccd: null });
                              }
                            }}
                            className={`border rounded px-2 py-1 w-full text-sm ${
                              editFamilyMemberErrors.cccd ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {editFamilyMemberErrors.cccd && (
                            <p className="text-red-500 text-xs mt-1">{editFamilyMemberErrors.cccd}</p>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-900">{member.cccd || 'N/A'}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingFamilyMemberId === member.memberID ? (
                        <input
                          type="text"
                          value={editFamilyMemberForm.relationship}
                          onChange={(e) => {
                            setEditFamilyMemberForm({ ...editFamilyMemberForm, relationship: e.target.value });
                          }}
                          className="border rounded px-2 py-1 w-full text-sm border-gray-300"
                          placeholder="Ví dụ: Vợ, Con, Chủ hộ..."
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{member.relationship || 'N/A'}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingFamilyMemberId === member.memberID ? (
                        <select
                          value={editFamilyMemberForm.gender || ''}
                          onChange={(e) => {
                            setEditFamilyMemberForm({ ...editFamilyMemberForm, gender: e.target.value });
                          }}
                          className="border rounded px-2 py-1 w-full text-sm border-gray-300"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {(() => {
                            // Map gender từ backend về tiếng Việt có dấu để hiển thị
                            const genderMap = {
                              'Male': 'Nam',
                              'Female': 'Nữ',
                              'Other': 'Khác'
                            };
                            return genderMap[member.gender] || member.gender || 'N/A';
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {editingFamilyMemberId === member.memberID ? (
                          <>
                            <button
                              onClick={() => handleSaveFamilyMember(member.memberID)}
                              className="text-green-600 hover:text-green-900"
                              title="Lưu"
                            >
                              <FiSave size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingFamilyMemberId(null);
                                setEditFamilyMemberErrors({});
                              }}
                              className="text-gray-600 hover:text-gray-900"
                              title="Hủy"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditFamilyMember(member)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Sửa thông tin"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleViewMedicalRecords(member)}
                              className="text-green-600 hover:text-green-900"
                              title="Xem bệnh án"
                            >
                              <FiFileText size={18} />
                            </button>
                            <label className="text-purple-600 hover:text-purple-900 cursor-pointer" title="Tải lên bệnh án">
                              <FiUpload size={18} />
                              <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    handleFileUpload(member.memberID, e.target.files);
                                    e.target.value = '';
                                  }
                                }}
                                disabled={uploadingFiles[member.memberID]}
                              />
                            </label>
                            <button
                              onClick={() => handleDeleteMember(member.memberID, member.fullName)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa thành viên"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Medical Records Modal */}
      {showMedicalRecordsModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn"
          style={{ zIndex: 10000, position: 'fixed' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMedicalRecordsModal(false);
              setMedicalRecords([]);
              setSelectedMemberId(null);
              setSelectedMemberName('');
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                📋 Bệnh án của {selectedMemberName || 'Bệnh nhân'}
              </h2>
              <div className="flex items-center gap-3">
                <label 
                  className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                  title="Tải lên bệnh án mới"
                >
                  <FiUpload size={18} />
                  <span className="text-sm font-medium">Tải lên</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        handleFileUpload(selectedMemberId, e.target.files);
                        e.target.value = '';
                      }
                    }}
                    disabled={uploadingFiles[selectedMemberId]}
                  />
                </label>
                <button
                  onClick={() => {
                    setShowMedicalRecordsModal(false);
                    setMedicalRecords([]);
                    setSelectedMemberId(null);
                    setSelectedMemberName('');
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  title="Đóng"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-2">
              {loadingRecords ? (
                <div className="flex items-center justify-center py-12">
                  <div className="dots-container">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              ) : medicalRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <FiFileText size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg">Chưa có bệnh án nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.recordID} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {editingRecordId === record.recordID ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Triệu chứng:</label>
                            <textarea
                              value={editRecordForm.symptoms}
                              onChange={(e) => setEditRecordForm({ ...editRecordForm, symptoms: e.target.value })}
                              className="w-full border rounded px-3 py-2 text-sm"
                              rows="2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán:</label>
                            <textarea
                              value={editRecordForm.diagnosis}
                              onChange={(e) => setEditRecordForm({ ...editRecordForm, diagnosis: e.target.value })}
                              className="w-full border rounded px-3 py-2 text-sm"
                              rows="2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kế hoạch điều trị:</label>
                            <textarea
                              value={editRecordForm.treatmentPlan}
                              onChange={(e) => setEditRecordForm({ ...editRecordForm, treatmentPlan: e.target.value })}
                              className="w-full border rounded px-3 py-2 text-sm"
                              rows="2"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveRecord(record.recordID)}
                              className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 text-sm"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => {
                                setEditingRecordId(null);
                                setEditRecordForm({});
                              }}
                              className="px-4 py-2 bg-gray-400 text-black rounded-lg hover:bg-gray-500 text-sm"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm text-gray-500">
                                Ngày tạo: {record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditRecord(record)}
                                className="text-blue-600 hover:text-blue-900 text-sm"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.recordID)}
                                className="text-red-600 hover:text-red-900 text-sm"
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          </div>
                          {record.symptoms && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Triệu chứng:</p>
                              <p className="text-sm text-gray-600">{record.symptoms}</p>
                            </div>
                          )}
                          {record.diagnosis && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Chẩn đoán:</p>
                              <p className="text-sm text-gray-600">{record.diagnosis}</p>
                            </div>
                          )}
                          {record.treatmentPlan && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Kế hoạch điều trị:</p>
                              <p className="text-sm text-gray-600">{record.treatmentPlan}</p>
                            </div>
                          )}
                          {record.fileLink && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                  <span className="text-blue-500">📄</span> File PDF đính kèm:
                                </h4>
                                <a
                                  href={record.fileLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 hover:underline"
                                  title="Mở PDF trong tab mới"
                                >
                                  <FiExternalLink size={14} />
                                  Mở trong tab mới
                                </a>
                              </div>
                              <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-gray-50">
                                <iframe
                                  src={record.fileLink}
                                  className="w-full"
                                  style={{ height: '500px', minHeight: '400px' }}
                                  title={`PDF bệnh án ${record.recordID}`}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Member Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Thêm thành viên mới vào gia đình</h2>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={newMember.fullName}
                  onChange={(e) => {
                    setNewMember({ ...newMember, fullName: e.target.value });
                    if (createErrors.fullName) {
                      setCreateErrors({ ...createErrors, fullName: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập họ tên"
                />
                {createErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.fullName}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={newMember.phoneNumber}
                  onChange={(e) => {
                    setNewMember({ ...newMember, phoneNumber: e.target.value });
                    if (createErrors.phoneNumber) {
                      setCreateErrors({ ...createErrors, phoneNumber: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập số điện thoại"
                />
                {createErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.phoneNumber}</p>
                )}
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={newMember.dateOfBirth}
                  onChange={(e) => {
                    setNewMember({ ...newMember, dateOfBirth: e.target.value });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* CCCD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCCD
                </label>
                <input
                  type="text"
                  value={newMember.cccd}
                  onChange={(e) => {
                    setNewMember({ ...newMember, cccd: e.target.value });
                    if (createErrors.cccd) {
                      setCreateErrors({ ...createErrors, cccd: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.cccd ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập số CCCD"
                  maxLength={12}
                />
                {createErrors.cccd && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.cccd}</p>
                )}
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  value={newMember.gender}
                  onChange={(e) => {
                    setNewMember({ ...newMember, gender: e.target.value });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Mối quan hệ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mối quan hệ
                </label>
                <select
                  value={newMember.relationship}
                  onChange={(e) => {
                    setNewMember({ ...newMember, relationship: e.target.value });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">-- Chọn mối quan hệ --</option>
                  <option value="Chủ hộ">Chủ hộ</option>
                  <option value="Vợ/Chồng">Vợ/Chồng</option>
                  <option value="Con">Con</option>
                  <option value="Cha/Mẹ">Cha/Mẹ</option>
                  <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCreateMember}
                className="flex-1 bg-blue-100 text-black px-4 py-2 rounded-lg hover:bg-blue-200 border border-blue-300 font-medium"
              >
                Tạo
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewMember({
                    fullName: '',
                    phoneNumber: '',
                    dateOfBirth: '',
                    cccd: '',
                    relationship: '',
                    gender: ''
                  });
                  setCreateErrors({});
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 border border-gray-300 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFamilyMembers;

