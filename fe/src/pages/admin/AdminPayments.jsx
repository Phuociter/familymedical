import React, { useEffect, useState, useMemo } from 'react';
import { getPayments, deletePayment, getFamilies, getDoctors } from '../../api/AdminAPI';
import { FiTrash2, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [families, setFamilies] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tìm kiếm và filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('paymentID');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, familiesData, doctorsData] = await Promise.all([
        getPayments(),
        getFamilies(),
        getDoctors(),
      ]);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setFamilies(Array.isArray(familiesData) ? familiesData : []);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      
      // Debug: Log để kiểm tra dữ liệu
      if (paymentsData && paymentsData.length > 0) {
        console.log('=== Payment Data Debug ===');
        console.log('Payment sample:', paymentsData[0]);
        console.log('Payment family:', paymentsData[0].family);
        console.log('Payment doctor:', paymentsData[0].doctor);
        console.log('Payment familyID:', paymentsData[0].familyID);
        console.log('Payment doctorID:', paymentsData[0].doctorID);
        console.log('Payment paymentStatus:', paymentsData[0].paymentStatus);
        console.log('Payment status (old):', paymentsData[0].status);
        console.log('Families count:', familiesData?.length || 0);
        console.log('Doctors count:', doctorsData?.length || 0);
        if (familiesData && familiesData.length > 0) {
          console.log('First family:', familiesData[0]);
        }
        if (doctorsData && doctorsData.length > 0) {
          console.log('First doctor:', doctorsData[0]);
        }
        console.log('========================');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPayments([]);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thanh toán này?')) return;
    try {
      await deletePayment(id);
      await loadData();
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Lỗi khi xóa');
    }
  };

  // Hàm helper để lấy tên gia đình
  const getFamilyName = (payment) => {
    if (!payment) return 'N/A';
    
    // Ưu tiên 1: Lấy từ family object nếu có
    if (payment.family && payment.family.familyName) {
      return payment.family.familyName;
    }
    
    // Ưu tiên 2: Lấy từ familyID và tìm trong mảng families
    const familyID = payment.familyID || (payment.family && payment.family.familyID);
    if (familyID && families && families.length > 0) {
      // Chuyển đổi sang number để so sánh (xử lý cả string và number)
      const id = typeof familyID === 'string' ? parseInt(familyID, 10) : Number(familyID);
      const family = families.find(f => {
        if (!f || f.familyID === undefined || f.familyID === null) return false;
        const fId = typeof f.familyID === 'string' ? parseInt(f.familyID, 10) : Number(f.familyID);
        return fId === id;
      });
      if (family && family.familyName) {
        return family.familyName;
      }
    }
    
    return 'N/A';
  };

  // Hàm helper để lấy tên bác sĩ
  const getDoctorName = (payment) => {
    if (!payment) return 'N/A';
    
    // Ưu tiên 1: Lấy từ doctor object nếu có
    if (payment.doctor && payment.doctor.fullName) {
      return payment.doctor.fullName;
    }
    
    // Ưu tiên 2: Lấy từ doctorID và tìm trong mảng doctors
    const doctorID = payment.doctorID || (payment.doctor && payment.doctor.userID);
    if (doctorID && doctors && doctors.length > 0) {
      // Chuyển đổi sang number để so sánh (xử lý cả string và number)
      const id = typeof doctorID === 'string' ? parseInt(doctorID, 10) : Number(doctorID);
      const doctor = doctors.find(d => {
        if (!d || d.userID === undefined || d.userID === null) return false;
        const dId = typeof d.userID === 'string' ? parseInt(d.userID, 10) : Number(d.userID);
        return dId === id;
      });
      if (doctor && doctor.fullName) {
        return doctor.fullName;
      }
    }
    
    return 'N/A';
  };

  // Tìm kiếm và filter
  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    
    let filtered = payments.filter((payment) => {
      const familyName = getFamilyName(payment);
      const doctorName = getDoctorName(payment);
      
      const matchesSearch = 
        !searchTerm ||
        familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.paymentMethod && payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        !filterStatus ||
        (payment.paymentStatus && payment.paymentStatus.toUpperCase() === filterStatus.toUpperCase());
      
      return matchesSearch && matchesStatus;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'paymentDate') {
        aValue = a.paymentDate ? new Date(a.paymentDate) : null;
        bValue = b.paymentDate ? new Date(b.paymentDate) : null;
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
  }, [payments, families, doctors, searchTerm, filterStatus, sortField, sortDirection]);

  // Phân trang
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

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
      // Uppercase versions
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Thất bại' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Thành công' },
      // Mixed case versions (from database enum)
      Completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Thành công' },
      Failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Thất bại' },
      Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
    };
    
    // Thử tìm với giá trị gốc trước (để hỗ trợ "Completed" từ database)
    let style = statusMap[status];
    
    // Nếu không tìm thấy, thử với uppercase
    if (!style) {
      const normalizedStatus = status.toUpperCase();
      style = statusMap[normalizedStatus];
    }
    
    // Fallback về PENDING nếu không tìm thấy
    style = style || statusMap.PENDING;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

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
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Thanh toán</h1>
        <p className="text-gray-600 mt-2">Quản lý các giao dịch thanh toán trong hệ thống</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Tổng số thanh toán</p>
          <p className="text-2xl font-bold text-gray-800">{filteredPayments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Tổng số tiền</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Đang chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-600">
            {filteredPayments.filter(p => p.paymentStatus && p.paymentStatus.toUpperCase() === 'PENDING').length}
          </p>
        </div>
      </div>

      {/* Tìm kiếm và Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="COMPLETED">Thành công</option>
              <option value="FAILED">Thất bại</option>
              <option value="PENDING">Chờ xử lý</option>
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">
              ({filteredPayments.length} kết quả)
            </span>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gia đình</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bác sĩ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thanh toán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Không có thanh toán nào
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => {
                  return (
                    <tr key={payment.paymentID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.family?.familyName || getFamilyName(payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.doctor?.fullName || getDoctorName(payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(payment.paymentID)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <FiTrash2 size={18} />
                        </button>
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
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredPayments.length)} trong tổng số {filteredPayments.length} kết quả
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

export default AdminPayments;

