import React, { useEffect, useState, useMemo } from 'react';
import { getFamilies, createFamily, updateFamily, deleteFamily } from '../../api/AdminAPI';
import { FiEdit, FiTrash2, FiX, FiSave, FiPlus, FiSearch, FiDownload, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { validators } from '../../utils/validation';

const AdminFamilies = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFamily, setNewFamily] = useState({
    familyName: '',
    address: '',
  });
  const [createErrors, setCreateErrors] = useState({});
  
  // Tìm kiếm và filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('familyID');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const data = await getFamilies();
      setFamilies(data);
    } catch (error) {
      console.error('Error loading families:', error);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (family) => {
    setEditingId(family.familyID);
    setEditForm({
      familyName: family.familyName || '',
      address: family.address || '',
    });
    setEditErrors({});
  };

  const validateEditForm = () => {
    const errors = {};
    if (editForm.familyName) {
      const nameError = validators.required(editForm.familyName, 'Tên gia đình') || 
                       validators.minLength(editForm.familyName, 2, 'Tên gia đình');
      if (nameError) errors.familyName = nameError;
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
      await updateFamily(id, editForm);
      await loadFamilies();
      setEditingId(null);
      setEditErrors({});
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating family:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi cập nhật';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa gia đình này?')) return;
    try {
      await deleteFamily(id);
      await loadFamilies();
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting family:', error);
      alert('Lỗi khi xóa');
    }
  };

  const validateCreateForm = () => {
    const errors = {};
    const nameError = validators.required(newFamily.familyName, 'Tên gia đình') || 
                     validators.minLength(newFamily.familyName, 2, 'Tên gia đình');
    if (nameError) errors.familyName = nameError;
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCreateForm()) {
      alert('Vui lòng sửa các lỗi trước khi tạo');
      return;
    }
    try {
      await createFamily(newFamily);
      await loadFamilies();
      setShowCreateModal(false);
      setNewFamily({ familyName: '', address: '' });
      setCreateErrors({});
      alert('Tạo gia đình thành công!');
    } catch (error) {
      console.error('Error creating family:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tạo gia đình';
      alert(errorMessage);
    }
  };

  // Tìm kiếm và filter
  const filteredFamilies = useMemo(() => {
    let filtered = families.filter((family) => {
      const matchesSearch = 
        !searchTerm ||
        (family.familyName && family.familyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (family.address && family.address.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'createdAt') {
        aValue = a.createdAt ? new Date(a.createdAt) : null;
        bValue = b.createdAt ? new Date(b.createdAt) : null;
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
  }, [families, searchTerm, sortField, sortDirection]);

  // Phân trang
  const paginatedFamilies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFamilies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFamilies, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage);

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
    const headers = ['ID', 'Tên gia đình', 'Địa chỉ', 'Ngày tạo'];
    const rows = filteredFamilies.map(family => [
      family.familyID,
      family.familyName || '',
      family.address || '',
      family.createdAt ? new Date(family.createdAt).toLocaleDateString('vi-VN') : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `danh_sach_gia_dinh_${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Gia đình</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin gia đình trong hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-black px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <FiDownload size={20} />
            Xuất CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <FiPlus size={20} />
            Thêm Gia đình
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
              placeholder="Tìm kiếm theo tên, địa chỉ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">
              ({filteredFamilies.length} kết quả)
            </span>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Thêm Gia đình mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên gia đình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFamily.familyName}
                  onChange={(e) => {
                    setNewFamily({ ...newFamily, familyName: e.target.value });
                    if (createErrors.familyName) {
                      setCreateErrors({ ...createErrors, familyName: null });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    createErrors.familyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên gia đình"
                />
                {createErrors.familyName && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.familyName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={newFamily.address}
                  onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Tạo
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFamily({ familyName: '', address: '' });
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

      {/* Families Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('familyID')}
                >
                  <div className="flex items-center gap-2">
                    ID
                    {sortField === 'familyID' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('familyName')}
                >
                  <div className="flex items-center gap-2">
                    Tên gia đình
                    {sortField === 'familyName' && (
                      sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Ngày tạo
                    {sortField === 'createdAt' && (
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
              {paginatedFamilies.map((family) => (
                <tr key={family.familyID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {family.familyID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === family.familyID ? (
                      <>
                        <input
                          type="text"
                          value={editForm.familyName}
                          onChange={(e) => {
                            setEditForm({ ...editForm, familyName: e.target.value });
                            if (editErrors.familyName) {
                              setEditErrors({ ...editErrors, familyName: null });
                            }
                          }}
                          className={`border rounded px-2 py-1 w-full ${
                            editErrors.familyName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {editErrors.familyName && (
                          <p className="text-red-500 text-xs mt-1">{editErrors.familyName}</p>
                        )}
                      </>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{family.familyName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === family.familyID ? (
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{family.address || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {family.createdAt
                      ? new Date(family.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {editingId === family.familyID ? (
                        <>
                          <button
                            onClick={() => handleSave(family.familyID)}
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
                            onClick={() => handleEdit(family)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Sửa"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(family.familyID)}
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
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredFamilies.length)} trong tổng số {filteredFamilies.length} kết quả
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
                          ? 'bg-blue-600 text-white border-blue-600'
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

export default AdminFamilies;

