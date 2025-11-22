import React, { useEffect, useState, useMemo } from 'react';
import { getDoctorRequests, approveDoctorRequestREST, rejectDoctorRequestREST, getFamilies, getDoctors, getDoctorRequestById } from '../../api/AdminAPI';
import { FiCheck, FiX, FiSearch, FiArrowUp, FiArrowDown, FiEye, FiInfo, FiFileText, FiActivity, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const AdminDoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [families, setFamilies] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // Tìm kiếm và filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFamily, setFilterFamily] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [sortField, setSortField] = useState('requestID');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, familiesData, doctorsData] = await Promise.all([
        getDoctorRequests(),
        getFamilies(),
        getDoctors(),
      ]);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      setFamilies(Array.isArray(familiesData) ? familiesData : []);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setRequests([]);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Bạn có chắc muốn phê duyệt yêu cầu này?')) return;
    try {
      setProcessingId(requestId);
      await approveDoctorRequestREST(requestId);
      await loadData();
      alert('Phê duyệt thành công!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Lỗi khi phê duyệt');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối yêu cầu này?')) return;
    try {
      setProcessingId(requestId);
      await rejectDoctorRequestREST(requestId);
      await loadData();
      alert('Từ chối thành công!');
      if (showDetailModal && selectedRequest?.requestID === requestId) {
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Lỗi khi từ chối');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetail = async (requestId) => {
    try {
      setLoadingDetail(true);
      const detail = await getDoctorRequestById(requestId);
      setSelectedRequest(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading detail:', error);
      alert('Lỗi khi tải chi tiết');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Thống kê
  const statistics = useMemo(() => {
    if (!Array.isArray(requests)) return { pending: 0, accepted: 0, rejected: 0, total: 0 };
    return {
      pending: requests.filter(r => {
        const s = r.status?.toUpperCase();
        return s === 'PENDING';
      }).length,
      accepted: requests.filter(r => {
        const s = r.status?.toUpperCase();
        return s === 'ACCEPTED';
      }).length,
      rejected: requests.filter(r => {
        const s = r.status?.toUpperCase();
        return s === 'REJECTED';
      }).length,
      total: requests.length
    };
  }, [requests]);

  // Tìm kiếm và filter
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(requests)) return [];
    
    let filtered = requests.filter((request) => {
      const family = request.family || families.find(f => f.familyID === request.family?.familyID);
      const doctor = request.doctor || doctors.find(d => d.userID === request.doctor?.userID);
      // Tìm kiếm theo tên chủ hộ hoặc tên gia đình
      const headOfFamilyName = family?.headOfFamily?.fullName || '';
      const familyName = family?.familyName || '';
      const doctorName = doctor?.fullName || '';
      
      const matchesSearch = 
        !searchTerm ||
        headOfFamilyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.message && request.message.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        !filterStatus ||
        request.status?.toUpperCase() === filterStatus.toUpperCase();
      
      const matchesFamily = 
        !filterFamily ||
        request.family?.familyID === parseInt(filterFamily);
      
      const matchesDoctor = 
        !filterDoctor ||
        request.doctor?.userID === parseInt(filterDoctor);
      
      return matchesSearch && matchesStatus && matchesFamily && matchesDoctor;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'requestDate') {
        aValue = a.requestDate ? new Date(a.requestDate) : null;
        bValue = b.requestDate ? new Date(b.requestDate) : null;
      } else if (sortField === 'family') {
        const familyA = a.family || families.find(f => f.familyID === a.family?.familyID);
        const familyB = b.family || families.find(f => f.familyID === b.family?.familyID);
        // Sắp xếp theo tên chủ hộ, nếu không có thì dùng tên gia đình
        aValue = familyA?.headOfFamily?.fullName || familyA?.familyName || '';
        bValue = familyB?.headOfFamily?.fullName || familyB?.familyName || '';
      } else if (sortField === 'doctor') {
        const doctorA = a.doctor || doctors.find(d => d.userID === a.doctor?.userID);
        const doctorB = b.doctor || doctors.find(d => d.userID === b.doctor?.userID);
        aValue = doctorA?.fullName || '';
        bValue = doctorB?.fullName || '';
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
  }, [requests, families, doctors, searchTerm, filterStatus, filterFamily, filterDoctor, sortField, sortDirection]);

  // Phân trang
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusMap = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã chấp nhận' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối' },
      // Fallback cho uppercase và capitalized (database format)
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã chấp nhận' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối' },
      Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      Accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã chấp nhận' },
      Rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối' },
    };
    
    // Thử tìm với giá trị gốc trước
    let style = statusMap[status];
    
    // Nếu không tìm thấy, thử với uppercase
    if (!style) {
      style = statusMap[status.toUpperCase()];
    }
    
    // Fallback về pending nếu không tìm thấy
    style = style || statusMap.pending;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;
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
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-[rgb(25,118,210)] p-3 rounded-xl shadow-lg">
            <FiFileText className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'rgb(25, 118, 210)' }}>Quản lý Yêu cầu Bác sĩ</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <FiActivity size={16} />
              Duyệt các yêu cầu bác sĩ từ gia đình
            </p>
          </div>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FiClock size={16} />
                Chờ duyệt
              </p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <FiClock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FiCheckCircle size={16} />
                Đã chấp nhận
              </p>
              <p className="text-2xl font-bold text-green-600">{statistics.accepted}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <FiCheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FiXCircle size={16} />
                Đã từ chối
              </p>
              <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <FiXCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[rgb(25,118,210)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-[rgb(25,118,210)]">{statistics.total}</p>
            </div>
            <FiInfo className="text-[rgb(25,118,210)]" size={24} />
          </div>
        </div>
      </div>

      {/* Tìm kiếm và Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo gia đình, bác sĩ..."
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
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="accepted">Đã chấp nhận</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div>
            <select
              value={filterFamily}
              onChange={(e) => {
                setFilterFamily(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            >
              <option value="">Tất cả gia đình</option>
              {families.map(family => (
                <option key={family.familyID} value={family.familyID}>
                  {family.familyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterDoctor}
              onChange={(e) => {
                setFilterDoctor(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(25,118,210)] focus:border-transparent"
            >
              <option value="">Tất cả bác sĩ</option>
              {doctors.map(doctor => (
                <option key={doctor.userID} value={doctor.userID}>
                  {doctor.fullName}
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
            </select>
            <span className="text-sm text-gray-600">
              ({filteredRequests.length} kết quả)
            </span>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('requestID')}
                >
                  ID {getSortIcon('requestID')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('family')}
                >
                  Chủ hộ {getSortIcon('family')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('doctor')}
                >
                  Bác sĩ {getSortIcon('doctor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tin nhắn</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Trạng thái {getSortIcon('status')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('requestDate')}
                >
                  Ngày yêu cầu {getSortIcon('requestDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có yêu cầu nào
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => {
                  // Sử dụng dữ liệu từ request nếu có, nếu không thì tìm từ mảng
                  const family = request.family || families.find(f => f.familyID === request.family?.familyID);
                  const doctor = request.doctor || doctors.find(d => d.userID === request.doctor?.userID);
                  
                  // Lấy tên chủ hộ từ family, nếu không có thì dùng tên gia đình
                  const headOfFamilyName = family?.headOfFamily?.fullName || family?.familyName || 'N/A';
                  const doctorName = doctor?.fullName || 'N/A';
                  
                  return (
                    <tr key={request.requestID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requestID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {headOfFamilyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctorName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {request.message || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.requestDate
                          ? new Date(request.requestDate).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(request.requestID)}
                            disabled={loadingDetail}
                            className="text-[rgb(25,118,210)] hover:text-[rgb(20,95,170)] disabled:opacity-50"
                            title="Xem chi tiết"
                          >
                            <FiEye size={18} />
                          </button>
                          {(request.status?.toUpperCase() === 'PENDING') && (
                            <>
                              <button
                                onClick={() => handleApprove(request.requestID)}
                                disabled={processingId === request.requestID}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Phê duyệt"
                              >
                                <FiCheck size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(request.requestID)}
                                disabled={processingId === request.requestID}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Từ chối"
                              >
                                <FiX size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredRequests.length)} trong tổng số {filteredRequests.length} kết quả
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

      {/* Modal Chi tiết */}
      {showDetailModal && selectedRequest && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Chi tiết Yêu cầu</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>
            <div className="p-6">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-8">
                  <div className="dots-container">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Yêu cầu</label>
                      <p className="text-gray-900">{selectedRequest.requestID}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày yêu cầu</label>
                      <p className="text-gray-900">
                        {selectedRequest.requestDate 
                          ? new Date(selectedRequest.requestDate).toLocaleString('vi-VN')
                          : 'N/A'}
                      </p>
                    </div>
                    {selectedRequest.responseDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày phản hồi</label>
                        <p className="text-gray-900">
                          {new Date(selectedRequest.responseDate).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin Gia đình</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedRequest.family ? (
                        <>
                          <p className="text-gray-900"><span className="font-medium">Tên gia đình:</span> {selectedRequest.family.familyName || 'N/A'}</p>
                          {selectedRequest.family.address && (
                            <p className="text-gray-900 mt-1"><span className="font-medium">Địa chỉ:</span> {selectedRequest.family.address}</p>
                          )}
                          {selectedRequest.family.headOfFamily && (
                            <p className="text-gray-900 mt-1"><span className="font-medium">Chủ hộ:</span> {selectedRequest.family.headOfFamily.fullName}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">Không có thông tin</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin Bác sĩ</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedRequest.doctor ? (
                        <>
                          <p className="text-gray-900"><span className="font-medium">Họ tên:</span> {selectedRequest.doctor.fullName || 'N/A'}</p>
                          {selectedRequest.doctor.email && (
                            <p className="text-gray-900 mt-1"><span className="font-medium">Email:</span> {selectedRequest.doctor.email}</p>
                          )}
                          {selectedRequest.doctor.phoneNumber && (
                            <p className="text-gray-900 mt-1"><span className="font-medium">Số điện thoại:</span> {selectedRequest.doctor.phoneNumber}</p>
                          )}
                          {selectedRequest.doctor.doctorCode && (
                            <p className="text-gray-900 mt-1"><span className="font-medium">Mã bác sĩ:</span> {selectedRequest.doctor.doctorCode}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">Không có thông tin</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tin nhắn</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {selectedRequest.message || 'Không có tin nhắn'}
                      </p>
                    </div>
                  </div>

                  {(selectedRequest.status?.toUpperCase() === 'PENDING') && (
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          handleApprove(selectedRequest.requestID);
                        }}
                        disabled={processingId === selectedRequest.requestID}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <FiCheck size={18} />
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedRequest.requestID);
                        }}
                        disabled={processingId === selectedRequest.requestID}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <FiX size={18} />
                        Từ chối
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorRequests;

