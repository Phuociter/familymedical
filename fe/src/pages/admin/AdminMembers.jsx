import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMembers, updateMember, deleteMember, uploadFiles, deleteFile, assignDoctor, getMemberFiles, updateMedicalRecord, getAssignedDoctors } from '../../api/AdminAPI';
import { getFamilies } from '../../api/AdminAPI';
import { getDoctors } from '../../api/AdminAPI';
import { FiEdit, FiTrash2, FiUpload, FiX, FiSave, FiSearch, FiDownload, FiArrowUp, FiArrowDown, FiFileText, FiExternalLink, FiUsers, FiUserCheck, FiHeart, FiActivity } from 'react-icons/fi';
import { validators } from '../../utils/validation';

const AdminMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [assigningDoctor, setAssigningDoctor] = useState({});
  const [showMedicalRecordsModal, setShowMedicalRecordsModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editRecordForm, setEditRecordForm] = useState({});
  const [showFamilyMembersModal, setShowFamilyMembersModal] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [selectedFamilyName, setSelectedFamilyName] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingFamilyMembers, setLoadingFamilyMembers] = useState(false);
  const [editingFamilyMemberId, setEditingFamilyMemberId] = useState(null);
  const [editFamilyMemberForm, setEditFamilyMemberForm] = useState({});
  const [editFamilyMemberErrors, setEditFamilyMemberErrors] = useState({});
  const [familyAssignments, setFamilyAssignments] = useState({}); // {familyId: [{assignmentId, doctorId, doctorName, ...}]}
  
  // Tìm kiếm và filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFamilyId, setFilterFamilyId] = useState('');
  const [sortField, setSortField] = useState('memberID');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (members.length > 0 && families.length > 0) {
      loadAllAssignments();
    }
  }, [members, families]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, familiesData, doctorsData] = await Promise.all([
        getMembers(),
        getFamilies(),
        getDoctors(),
      ]);
      setMembers(membersData);
      setFamilies(familiesData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadAllAssignments = async () => {
    try {
      const uniqueFamilyIds = [...new Set(members.map(m => m.familyID))];
      const assignmentsPromises = uniqueFamilyIds.map(async (familyId) => {
        try {
          const assigned = await getAssignedDoctors(familyId);
          return { familyId, assignments: assigned || [] };
        } catch (error) {
          return { familyId, assignments: [] };
        }
      });
      const results = await Promise.all(assignmentsPromises);
      const assignmentsMap = {};
      results.forEach(({ familyId, assignments }) => {
        assignmentsMap[familyId] = assignments;
      });
      setFamilyAssignments(assignmentsMap);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleEdit = (member) => {
    // Map gender từ backend (Male/Female/Other) về tiếng Việt có dấu cho form
    let displayGender = member.gender || '';
    if (displayGender) {
      const genderMapToVietnamese = {
        'Male': 'Nam',
        'Female': 'Nữ',
        'Other': 'Khác'
      };
      displayGender = genderMapToVietnamese[displayGender] || displayGender;
    }
    
    setEditingId(member.memberID);
    setEditForm({
      fullName: member.fullName || '',
      phoneNumber: member.phoneNumber || '',
      dateOfBirth: member.dateOfBirth || '',
      cccd: member.cccd || '',
      relationship: member.relationship || '',
      gender: displayGender
    });
    setEditErrors({});
  };

  const validateEditForm = () => {
    const errors = {};
    if (editForm.phoneNumber) {
      const phoneError = validators.phone(editForm.phoneNumber);
      if (phoneError) errors.phoneNumber = phoneError;
    }
    if (editForm.cccd) {
      const cccdError = validators.cccd(editForm.cccd);
      if (cccdError) errors.cccd = cccdError;
    }
    if (editForm.dateOfBirth) {
      const dateError = validators.date(editForm.dateOfBirth);
      if (dateError) errors.dateOfBirth = dateError;
    }
    if (editForm.fullName) {
      const nameError = validators.minLength(editForm.fullName, 2, 'Họ tên');
      if (nameError) errors.fullName = nameError;
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (id) => {
    if (!validateEditForm()) {
      alert('Vui lòng sửa các lỗi trước khi lưu');
      return;
    }
    try {
      // Map gender từ tiếng Việt có dấu sang GraphQL enum (Male, Female, Other)
      const updateData = { ...editForm };
      if (updateData.gender) {
        const genderMap = {
          'Nam': 'Male',
          'Nữ': 'Female',
          'Khác': 'Other'
        };
        updateData.gender = genderMap[updateData.gender] || updateData.gender;
      }
      
      await updateMember(id, updateData);
      await loadData();
      await loadAllAssignments();
      setEditingId(null);
      setEditErrors({});
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi cập nhật';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bệnh nhân này?')) return;
    try {
      await deleteMember(id);
      await loadData();
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Lỗi khi xóa');
    }
  };

  const loadMedicalRecords = async (memberId) => {
    try {
      const records = await getMemberFiles(memberId);
      setMedicalRecords(records);
    } catch (error) {
      console.error('Error loading medical records:', error);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecordId(record.recordID);
    setEditRecordForm({
      symptoms: record.symptoms || '',
      diagnosis: record.diagnosis || '',
      treatmentPlan: record.treatmentPlan || '',
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
      console.error('Error updating medical record:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi cập nhật bệnh án';
      alert(errorMessage);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bệnh án này?')) return;
    try {
      await deleteFile(recordId);
      await loadMedicalRecords(selectedMemberId);
      alert('Xóa bệnh án thành công!');
    } catch (error) {
      console.error('Error deleting medical record:', error);
      alert('Lỗi khi xóa bệnh án');
    }
  };

  const handleFileUpload = async (memberId, files) => {
    if (files.length === 0) return;
    setUploadingFiles({ ...uploadingFiles, [memberId]: true });
    try {
      await uploadFiles(memberId, files);
      await loadData();
      
      // Nếu popup đang mở cho member này, reload lại danh sách bệnh án
      if (showMedicalRecordsModal && selectedMemberId === memberId) {
        await loadMedicalRecords(memberId);
      }
      
      alert('Tải lên thành công!');
    } catch (error) {
      console.error('Error uploading files:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Lỗi khi tải lên';
      alert(errorMessage);
    } finally {
      setUploadingFiles({ ...uploadingFiles, [memberId]: false });
    }
  };

  const handleAssignDoctor = async (memberId, doctorId) => {
    setAssigningDoctor({ ...assigningDoctor, [memberId]: true });
    try {
      await assignDoctor(memberId, doctorId);
      alert('Phân công bác sĩ thành công!');
    } catch (error) {
      console.error('Error assigning doctor:', error);
      alert('Lỗi khi phân công bác sĩ');
    } finally {
      setAssigningDoctor({ ...assigningDoctor, [memberId]: false });
    }
  };

  const handleViewMedicalRecords = async (member) => {
    console.log('Opening medical records modal for member:', member);
    if (!member || !member.memberID) {
      alert('Lỗi: Không tìm thấy thông tin bệnh nhân');
      return;
    }
    
    // Đóng modal danh sách thành viên nếu đang mở
    if (showFamilyMembersModal) {
      setShowFamilyMembersModal(false);
    }
    
    setSelectedMemberId(member.memberID);
    setSelectedMemberName(member.fullName || 'Bệnh nhân');
    setLoadingRecords(true);
    setMedicalRecords([]);
    setShowMedicalRecordsModal(true);
    
    try {
      await loadMedicalRecords(member.memberID);
    } catch (error) {
      console.error('Error loading medical records:', error);
      alert('Lỗi khi tải bệnh án: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setLoadingRecords(false);
    }
  };

  const getFamilyName = (familyId) => {
    const family = families.find((f) => f.familyID === familyId);
    return family ? family.familyName : 'N/A';
  };

  // Lấy danh sách thành viên của một gia đình
  const loadFamilyMembers = async (familyId) => {
    setLoadingFamilyMembers(true);
    try {
      // Lọc tất cả members của gia đình này
      const membersOfFamily = members.filter(m => m.familyID === familyId);
      setFamilyMembers(membersOfFamily);
    } catch (error) {
      console.error('Error loading family members:', error);
      alert('Lỗi khi tải danh sách thành viên');
    } finally {
      setLoadingFamilyMembers(false);
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
      gender: genderForForm,
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
      await loadData(); // Reload tất cả members
      if (selectedFamilyId) {
        await loadFamilyMembers(selectedFamilyId); // Reload lại danh sách thành viên gia đình
      }
      setEditingFamilyMemberId(null);
      setEditFamilyMemberErrors({});
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating family member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi cập nhật';
      alert(errorMessage);
    }
  };

  const handleViewFamilyMembers = (member) => {
    navigate(`/admin/family-members/${member.familyID}`);
  };

  // Tìm kiếm và filter - CHỈ HIỂN THỊ CHỦ HỘ
  const filteredMembers = useMemo(() => {
    // Chỉ lấy các member có relationship là "Chủ hộ"
    let filtered = members.filter((member) => {
      // Kiểm tra là chủ hộ
      const isHeadOfHousehold = member.relationship === 'Chủ hộ';
      
      if (!isHeadOfHousehold) return false;
      
      const matchesSearch = 
        !searchTerm ||
        (member.fullName && member.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.phoneNumber && member.phoneNumber.includes(searchTerm)) ||
        (member.cccd && member.cccd.includes(searchTerm)) ||
        (getFamilyName(member.familyID) && getFamilyName(member.familyID).toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFamily = !filterFamilyId || member.familyID === parseInt(filterFamilyId);
      
      return matchesSearch && matchesFamily;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'familyID') {
        aValue = getFamilyName(a.familyID);
        bValue = getFamilyName(b.familyID);
      }
      
      if (sortField === 'dateOfBirth') {
        aValue = a.dateOfBirth ? new Date(a.dateOfBirth) : null;
        bValue = b.dateOfBirth ? new Date(b.dateOfBirth) : null;
      }
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [members, searchTerm, filterFamilyId, sortField, sortDirection, families]);

  // Phân trang
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Họ tên', 'SĐT', 'Ngày sinh', 'CCCD', 'Gia đình', 'Mối quan hệ'];
    const rows = filteredMembers.map(member => [
      member.memberID,
      member.fullName || '',
      member.phoneNumber || '',
      member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('vi-VN') : '',
      member.cccd || '',
      getFamilyName(member.familyID),
      member.relationship || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `danh_sach_benh_nhan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
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
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-[rgb(25,118,210)] p-3 rounded-xl shadow-lg">
                <FiHeart className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'rgb(25, 118, 210)' }}>Quản lý Chủ hộ</h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FiActivity size={16} />
                  Quản lý thông tin chủ hộ trong hệ thống. Click nút <FiUsers className="inline" size={16} /> để xem danh sách thành viên gia đình
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-100 flex items-center gap-2 transition-colors whitespace-nowrap border border-emerald-200 shadow-sm"
            >
              <FiDownload size={20} />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tìm kiếm và Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, CCCD, gia đình..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterFamilyId}
              onChange={(e) => {
                setFilterFamilyId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            >
              <option value="">Tất cả gia đình</option>
              {families.map((family) => (
                <option key={family.familyID} value={family.familyID}>
                  {family.familyName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">
              ({filteredMembers.length} kết quả)
            </span>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('memberID')}
                >
                  <div className="flex items-center gap-2">
                    ID
                    {sortField === 'memberID' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-2">
                    Tên
                    {sortField === 'fullName' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SĐT
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dateOfBirth')}
                >
                  <div className="flex items-center gap-2">
                    Ngày sinh
                    {sortField === 'dateOfBirth' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CCCD
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('familyID')}
                >
                  <div className="flex items-center gap-2">
                    Gia đình
                    {sortField === 'familyID' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác sĩ phụ trách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedMembers.map((member) => (
                <tr key={member.memberID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.memberID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === member.memberID ? (
                      <>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => {
                            setEditForm({ ...editForm, fullName: e.target.value });
                            if (editErrors.fullName) {
                              setEditErrors({ ...editErrors, fullName: null });
                            }
                          }}
                          className={`border rounded px-2 py-1 w-full ${
                            editErrors.fullName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {editErrors.fullName && (
                          <p className="text-red-500 text-xs mt-1">{editErrors.fullName}</p>
                        )}
                      </>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{member.fullName || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === member.memberID ? (
                      <>
                        <input
                          type="text"
                          value={editForm.phoneNumber}
                          onChange={(e) => {
                            setEditForm({ ...editForm, phoneNumber: e.target.value });
                            if (editErrors.phoneNumber) {
                              setEditErrors({ ...editErrors, phoneNumber: null });
                            }
                          }}
                          className={`border rounded px-2 py-1 w-full ${
                            editErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {editErrors.phoneNumber && (
                          <p className="text-red-500 text-xs mt-1">{editErrors.phoneNumber}</p>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-900">{member.phoneNumber || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === member.memberID ? (
                      <>
                        <input
                          type="date"
                          value={editForm.dateOfBirth}
                          onChange={(e) => {
                            setEditForm({ ...editForm, dateOfBirth: e.target.value });
                            if (editErrors.dateOfBirth) {
                              setEditErrors({ ...editErrors, dateOfBirth: null });
                            }
                          }}
                          className={`border rounded px-2 py-1 w-full ${
                            editErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {editErrors.dateOfBirth && (
                          <p className="text-red-500 text-xs mt-1">{editErrors.dateOfBirth}</p>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === member.memberID ? (
                      <>
                        <input
                          type="text"
                          value={editForm.cccd}
                          onChange={(e) => {
                            setEditForm({ ...editForm, cccd: e.target.value });
                            if (editErrors.cccd) {
                              setEditErrors({ ...editErrors, cccd: null });
                            }
                          }}
                          className={`border rounded px-2 py-1 w-full ${
                            editErrors.cccd ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {editErrors.cccd && (
                          <p className="text-red-500 text-xs mt-1">{editErrors.cccd}</p>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-900">{member.cccd || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getFamilyName(member.familyID)}
                  </td>
                  <td className="px-6 py-4">
                    {(familyAssignments[member.familyID] || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {familyAssignments[member.familyID].map((assignment) => (
                          <div
                            key={assignment.assignmentId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(25,118,210,0.1)] text-[rgb(25,118,210)] rounded-md text-xs border border-[rgba(25,118,210,0.3)]"
                          >
                            <FiUserCheck size={14} />
                            <span className="font-medium">{assignment.doctorName}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {editingId === member.memberID ? (
                        <>
                          <button
                            onClick={() => handleSave(member.memberID)}
                            className="text-green-600 hover:text-green-900"
                            title="Lưu"
                          >
                            <FiSave size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Hủy"
                          >
                            <FiX size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-[rgb(25,118,210)] hover:text-[rgb(20,95,170)]"
                            title="Sửa"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleViewFamilyMembers(member)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Xem danh sách thành viên gia đình"
                          >
                            <FiUsers size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(member.memberID)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredMembers.length)} trong tổng số {filteredMembers.length} kết quả
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border border-gray-300 rounded-lg ${
                        currentPage === page
                          ? 'bg-[rgb(25,118,210)] text-white border-[rgb(25,118,210)]'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Medical Records Popup */}
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
                  className="text-[rgb(25,118,210)] hover:text-[rgb(25,118,210)] cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[rgba(25,118,210,0.1)] transition-colors border border-[rgba(25,118,210,0.3)]"
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
                        e.target.value = ''; // Reset input để có thể chọn lại file giống nhau
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
              {uploadingFiles[selectedMemberId] && (
                <div className="mb-4 p-3 bg-[rgba(25,118,210,0.1)] border border-[rgba(25,118,210,0.3)] rounded-lg flex items-center gap-2">
                  <div className="dots-container">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <span className="text-sm text-[rgb(25,118,210)]">Đang tải lên file...</span>
                </div>
              )}
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
                  <p className="text-gray-500 text-lg">Chưa có bệnh án nào cho bệnh nhân này</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div
                      key={record.recordID}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 bg-white"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 mb-1">
                            Bệnh án #{record.recordID}
                          </h3>
                          <p className="text-sm text-gray-500">
                            📅 Ngày khám: {record.recordDate 
                              ? new Date(record.recordDate).toLocaleString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.fileLink && (
                            <a
                              href={record.fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[rgb(25,118,210)] hover:text-[rgb(25,118,210)] flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[rgba(25,118,210,0.1)] transition-colors"
                              title="Mở PDF trong tab mới"
                            >
                              <FiExternalLink size={18} />
                              <span className="text-sm font-medium">Mở PDF</span>
                            </a>
                          )}
                          {editingRecordId === record.recordID ? (
                            <>
                              <button
                                onClick={() => handleSaveRecord(record.recordID)}
                                className="text-green-600 hover:text-green-800 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                                title="Lưu"
                              >
                                <FiSave size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRecordId(null);
                                  setEditRecordForm({});
                                }}
                                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Hủy"
                              >
                                <FiX size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditRecord(record)}
                                className="text-[rgb(25,118,210)] hover:text-[rgb(25,118,210)] px-3 py-2 rounded-lg hover:bg-[rgba(25,118,210,0.1)] transition-colors"
                                title="Sửa bệnh án"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.recordID)}
                                className="text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Xóa bệnh án"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="text-orange-500">🔍</span> Triệu chứng:
                          </h4>
                          {editingRecordId === record.recordID ? (
                            <textarea
                              value={editRecordForm.symptoms}
                              onChange={(e) => setEditRecordForm({ ...editRecordForm, symptoms: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                              rows="4"
                              placeholder="Nhập triệu chứng..."
                            />
                          ) : (
                            <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-100">
                              {record.symptoms || 'Chưa có thông tin'}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="text-red-500">🏥</span> Chẩn đoán:
                          </h4>
                          {editingRecordId === record.recordID ? (
                            <textarea
                              value={editRecordForm.diagnosis}
                              onChange={(e) => setEditRecordForm({ ...editRecordForm, diagnosis: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                              rows="4"
                              placeholder="Nhập chẩn đoán..."
                            />
                          ) : (
                            <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100">
                              {record.diagnosis || 'Chưa có thông tin'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="text-green-500">💊</span> Kế hoạch điều trị:
                        </h4>
                        {editingRecordId === record.recordID ? (
                          <textarea
                            value={editRecordForm.treatmentPlan}
                            onChange={(e) => setEditRecordForm({ ...editRecordForm, treatmentPlan: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                            rows="4"
                            placeholder="Nhập kế hoạch điều trị..."
                          />
                        ) : (
                          <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">
                            {record.treatmentPlan || 'Chưa có thông tin'}
                          </p>
                        )}
                      </div>
                      
                      {/* Hiển thị PDF viewer */}
                      {record.fileLink && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                              <span className="text-[rgb(25,118,210)]">📄</span> File PDF đính kèm:
                            </h4>
                            <a
                              href={record.fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[rgb(25,118,210)] hover:text-[rgb(25,118,210)] text-sm flex items-center gap-1 hover:underline"
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
                              style={{ height: '600px', minHeight: '400px' }}
                              title={`PDF bệnh án ${record.recordID}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowMedicalRecordsModal(false);
                  setMedicalRecords([]);
                  setSelectedMemberId(null);
                  setSelectedMemberName('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family Members Modal */}
      {showFamilyMembersModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50] animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFamilyMembersModal(false);
              setFamilyMembers([]);
              setSelectedFamilyId(null);
              setSelectedFamilyName('');
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                👨‍👩‍👧‍👦 Thành viên gia đình: {selectedFamilyName}
              </h2>
              <button
                onClick={() => {
                  setShowFamilyMembersModal(false);
                  setFamilyMembers([]);
                  setSelectedFamilyId(null);
                  setSelectedFamilyName('');
                }}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
                title="Đóng"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-2">
              {loadingFamilyMembers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="dots-container">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              ) : familyMembers.length === 0 ? (
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
                                  <span className="ml-2 px-2 py-1 text-xs bg-[rgba(25,118,210,0.15)] text-[rgb(25,118,210)] rounded-full">Chủ hộ</span>
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
                                    className="text-[rgb(25,118,210)] hover:text-[rgb(20,95,170)]"
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
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-sm text-gray-600">
                    Tổng số thành viên: <span className="font-semibold">{familyMembers.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowFamilyMembersModal(false);
                  setFamilyMembers([]);
                  setSelectedFamilyId(null);
                  setSelectedFamilyName('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;

