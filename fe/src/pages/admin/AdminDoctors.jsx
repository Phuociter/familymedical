import React, { useEffect, useState, useMemo } from 'react';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../api/AdminAPI';
import { FiEdit, FiTrash2, FiX, FiSave, FiPlus, FiSearch, FiDownload, FiArrowUp, FiArrowDown, FiUserCheck, FiActivity, FiShield } from 'react-icons/fi';
import { validators, validateField } from '../../utils/validation';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    cccd: '',
    doctorCode: '',
    role: 'BacSi',
  });
  const [createErrors, setCreateErrors] = useState({});
  
  // Tìm kiếm và filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [sortField, setSortField] = useState('userID');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.userID);
    setEditForm({
      fullName: doctor.fullName || '',
      phoneNumber: doctor.phoneNumber || '',
      address: doctor.address || '',
      cccd: doctor.cccd || '',
      doctorCode: doctor.doctorCode || '',
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
      await updateDoctor(id, editForm);
      await loadDoctors();
      setEditingId(null);
      setEditErrors({});
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating doctor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi cập nhật';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bác sĩ này?')) return;
    try {
      await deleteDoctor(id);
      await loadDoctors();
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Lỗi khi xóa');
    }
  };

  const validateCreateForm = () => {
    const errors = {};
    
    // Required fields
    const fullNameError = validators.required(newDoctor.fullName, 'Họ tên');
    if (fullNameError) errors.fullName = fullNameError;
    
    const emailError = validators.required(newDoctor.email, 'Email') || validators.email(newDoctor.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validators.required(newDoctor.password, 'Mật khẩu') || validators.password(newDoctor.password);
    if (passwordError) errors.password = passwordError;
    
    // Optional fields validation
    if (newDoctor.phoneNumber) {
      const phoneError = validators.phone(newDoctor.phoneNumber);
      if (phoneError) errors.phoneNumber = phoneError;
    }
    
    if (newDoctor.cccd) {
      const cccdError = validators.cccd(newDoctor.cccd);
      if (cccdError) errors.cccd = cccdError;
    }
    
    if (newDoctor.fullName && !errors.fullName) {
      const nameLengthError = validators.minLength(newDoctor.fullName, 2, 'Họ tên');
      if (nameLengthError) errors.fullName = nameLengthError;
    }
    
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCreateForm()) {
      alert('Vui lòng sửa các lỗi trước khi tạo');
      return;
    }
    try {
      await createDoctor(newDoctor);
      await loadDoctors();
      setShowCreateModal(false);
      setNewDoctor({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
        cccd: '',
        doctorCode: '',
        role: 'BacSi',
      });
      setCreateErrors({});
      alert('Tạo bác sĩ thành công!');
    } catch (error) {
      console.error('Error creating doctor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tạo bác sĩ';
      alert(errorMessage);
    }
  };

  // Tìm kiếm và filter
  const filteredDoctors = useMemo(() => {
    let filtered = doctors.filter((doctor) => {
      const matchesSearch = 
        !searchTerm ||
        (doctor.fullName && doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doctor.email && doctor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doctor.doctorCode && doctor.doctorCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doctor.phoneNumber && doctor.phoneNumber.includes(searchTerm));
      
      const matchesVerified = 
        filterVerified === '' || 
        (filterVerified === 'verified' && doctor.isVerified) ||
        (filterVerified === 'unverified' && !doctor.isVerified);
      
      return matchesSearch && matchesVerified;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'boolean') {
        return sortDirection === 'asc' 
          ? (aValue === bValue ? 0 : aValue ? -1 : 1)
          : (aValue === bValue ? 0 : aValue ? 1 : -1);
      }
      
      return sortDirection === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [doctors, searchTerm, filterVerified, sortField, sortDirection]);

  // Phân trang
  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDoctors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDoctors, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

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
    const headers = ['ID', 'Họ tên', 'Email', 'SĐT', 'Địa chỉ', 'Mã BS', 'Trạng thái'];
    const rows = filteredDoctors.map(doctor => [
      doctor.userID,
      doctor.fullName || '',
      doctor.email || '',
      doctor.phoneNumber || '',
      doctor.address || '',
      doctor.doctorCode || '',
      doctor.isVerified ? 'Đã xác thực' : 'Chưa xác thực'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `danh_sach_bac_si_${new Date().toISOString().split('T')[0]}.csv`;
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-[rgb(25,118,210)] p-3 rounded-xl shadow-lg">
              <FiUserCheck className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'rgb(25, 118, 210)' }}>Quản lý Bác sĩ</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <FiActivity size={16} />
                Quản lý thông tin bác sĩ trong hệ thống
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-100 flex items-center gap-2 transition-colors border border-emerald-200 shadow-sm"
          >
            <FiDownload size={20} />
            Xuất CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[rgb(25,118,210)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(20,95,170)] flex items-center gap-2 transition-colors shadow-md"
          >
            <FiPlus size={20} />
            Thêm Bác sĩ
          </button>
        </div>
      </div>

      {/* Tìm kiếm và Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, mã BS..."
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
              value={filterVerified}
              onChange={(e) => {
                setFilterVerified(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="verified">Đã xác thực</option>
              <option value="unverified">Chưa xác thực</option>
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
              ({filteredDoctors.length} kết quả)
            </span>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Thêm Bác sĩ mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDoctor.fullName}
                  onChange={(e) => {
                    setNewDoctor({ ...newDoctor, fullName: e.target.value });
                    if (createErrors.fullName) {
                      setCreateErrors({ ...createErrors, fullName: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {createErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => {
                    setNewDoctor({ ...newDoctor, email: e.target.value });
                    if (createErrors.email) {
                      setCreateErrors({ ...createErrors, email: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {createErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newDoctor.password}
                  onChange={(e) => {
                    setNewDoctor({ ...newDoctor, password: e.target.value });
                    if (createErrors.password) {
                      setCreateErrors({ ...createErrors, password: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {createErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="text"
                  value={newDoctor.phoneNumber}
                  onChange={(e) => {
                    setNewDoctor({ ...newDoctor, phoneNumber: e.target.value });
                    if (createErrors.phoneNumber) {
                      setCreateErrors({ ...createErrors, phoneNumber: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {createErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.phoneNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={newDoctor.address}
                  onChange={(e) => setNewDoctor({ ...newDoctor, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CCCD</label>
                <input
                  type="text"
                  value={newDoctor.cccd}
                  onChange={(e) => {
                    setNewDoctor({ ...newDoctor, cccd: e.target.value });
                    if (createErrors.cccd) {
                      setCreateErrors({ ...createErrors, cccd: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.cccd ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {createErrors.cccd && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.cccd}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã bác sĩ</label>
                <input
                  type="text"
                  value={newDoctor.doctorCode}
                  onChange={(e) => setNewDoctor({ ...newDoctor, doctorCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreate}
                className="flex-1 bg-[rgb(25,118,210)] text-black px-4 py-2 rounded-lg hover:bg-[rgb(20,95,170)]"
              >
                Tạo
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDoctor({
                    fullName: '',
                    email: '',
                    password: '',
                    phoneNumber: '',
                    address: '',
                    cccd: '',
                    doctorCode: '',
                    role: 'BacSi',
                  });
                  setCreateErrors({});
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('userID')}
                >
                  <div className="flex items-center gap-2">
                    ID
                    {sortField === 'userID' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-2">
                    Họ tên
                    {sortField === 'fullName' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortField === 'email' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SĐT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('doctorCode')}
                >
                  <div className="flex items-center gap-2">
                    Mã BS
                    {sortField === 'doctorCode' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('isVerified')}
                >
                  <div className="flex items-center gap-2">
                    Trạng thái
                    {sortField === 'isVerified' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDoctors.map((doctor) => (
                <tr key={doctor.userID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.userID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === doctor.userID ? (
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
                      <div className="text-sm font-medium text-gray-900">{doctor.fullName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === doctor.userID ? (
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
                      <div className="text-sm text-gray-900">{doctor.phoneNumber || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === doctor.userID ? (
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{doctor.address || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === doctor.userID ? (
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
                      <div className="text-sm text-gray-900">{doctor.cccd || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1.5 w-fit ${
                        doctor.isVerified
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}
                    >
                      {doctor.isVerified ? (
                        <>
                          <FiShield size={14} />
                          Đã xác thực
                        </>
                      ) : (
                        <>
                          <FiShield size={14} />
                          Chưa xác thực
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {editingId === doctor.userID ? (
                        <>
                          <button
                            onClick={() => handleSave(doctor.userID)}
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
                            onClick={() => handleEdit(doctor)}
                            className="text-[rgb(25,118,210)] hover:text-[rgb(20,95,170)]"
                            title="Sửa"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(doctor.userID)}
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
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredDoctors.length)} trong tổng số {filteredDoctors.length} kết quả
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
    </div>
  );
};

export default AdminDoctors;

