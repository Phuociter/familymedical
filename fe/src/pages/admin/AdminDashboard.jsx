import React, { useEffect, useState } from 'react';
import { 
  getMembers, 
  getDoctors, 
  getFamilies, 
  getDoctorRequests, 
  getPayments 
} from '../../api/AdminAPI';
import { 
  FiUsers, 
  FiUserCheck, 
  FiFolder, 
  FiActivity, 
  FiFileText, 
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiTrendingUp
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    members: 0,
    doctors: 0,
    families: 0,
    doctorRequests: {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
    },
    payments: {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
      totalAmount: 0,
    },
    verifiedDoctors: 0,
    unverifiedDoctors: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [members, doctors, families, doctorRequests, payments] = await Promise.all([
          getMembers(),
          getDoctors(),
          getFamilies(),
          getDoctorRequests(),
          getPayments(),
        ]);

        // Tính toán thống kê yêu cầu bác sĩ
        const requestsStats = {
          total: doctorRequests.length,
          pending: doctorRequests.filter(r => r.status === 'PENDING' || r.status === 'pending').length,
          accepted: doctorRequests.filter(r => r.status === 'ACCEPTED' || r.status === 'accepted').length,
          rejected: doctorRequests.filter(r => r.status === 'REJECTED' || r.status === 'rejected').length,
        };

        // Tính toán thống kê thanh toán
        // Hàm helper để kiểm tra trạng thái hoàn thành (chỉ COMPLETED)
        const isCompletedStatus = (status) => {
          if (!status) return false;
          const upperStatus = status.toUpperCase();
          return upperStatus === 'COMPLETED';
        };
        
        // Hàm helper để kiểm tra trạng thái thất bại
        const isFailedStatus = (status) => {
          if (!status) return false;
          const upperStatus = status.toUpperCase();
          return upperStatus === 'FAILED';
        };
        
        // Hàm helper để kiểm tra trạng thái chờ xử lý
        const isPendingStatus = (status) => {
          if (!status) return false;
          const upperStatus = status.toUpperCase();
          return upperStatus === 'PENDING';
        };
        
        const paymentsStats = {
          total: payments.length,
          success: payments.filter(p => isCompletedStatus(p.paymentStatus || p.status)).length,
          failed: payments.filter(p => isFailedStatus(p.paymentStatus || p.status)).length,
          pending: payments.filter(p => isPendingStatus(p.paymentStatus || p.status)).length,
          totalAmount: payments
            .filter(p => isCompletedStatus(p.paymentStatus || p.status))
            .reduce((sum, p) => sum + (p.amount || 0), 0),
        };

        // Tính toán bác sĩ đã xác thực/chưa xác thực
        const verifiedDoctors = doctors.filter(d => d.isVerified === true).length;
        const unverifiedDoctors = doctors.filter(d => d.isVerified === false || !d.isVerified).length;

        setStats({
          members: members.length,
          doctors: doctors.length,
          families: families.length,
          doctorRequests: requestsStats,
          payments: paymentsStats,
          verifiedDoctors,
          unverifiedDoctors,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({ ...stats, loading: false });
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Tổng Bệnh nhân',
      value: stats.members,
      icon: FiUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Tổng Bác sĩ',
      value: stats.doctors,
      icon: FiUserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      subtitle: `${stats.verifiedDoctors} đã xác thực`,
    },
    {
      title: 'Tổng Gia đình',
      value: stats.families,
      icon: FiFolder,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Yêu cầu Bác sĩ',
      value: stats.doctorRequests.total,
      icon: FiFileText,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      subtitle: `${stats.doctorRequests.pending} đang chờ`,
    },
    {
      title: 'Tổng Thanh toán',
      value: stats.payments.total,
      icon: FiDollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      subtitle: `${stats.payments.success} thành công`,
    },
    {
      title: 'Doanh thu',
      value: new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(stats.payments.totalAmount),
      icon: FiTrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      subtitle: 'Tổng doanh thu',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển Admin</h1>
        <p className="text-gray-600 mt-2">Tổng quan hệ thống quản lý y tế gia đình</p>
      </div>

      {stats.loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="dots-container">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`${stat.color} p-4 rounded-lg`}>
                      <Icon size={28} className="text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Doctor Requests Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiFileText className="text-orange-500" />
                Thống kê Yêu cầu Bác sĩ
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiClock className="text-orange-500" size={20} />
                    <span className="text-gray-700 font-medium">Đang chờ xử lý</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {stats.doctorRequests.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-500" size={20} />
                    <span className="text-gray-700 font-medium">Đã chấp nhận</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {stats.doctorRequests.accepted}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiXCircle className="text-red-500" size={20} />
                    <span className="text-gray-700 font-medium">Đã từ chối</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.doctorRequests.rejected}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Tổng số yêu cầu</span>
                    <span className="text-xl font-bold text-gray-800">
                      {stats.doctorRequests.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiDollarSign className="text-emerald-500" />
                Thống kê Thanh toán
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-emerald-500" size={20} />
                    <span className="text-gray-700 font-medium">Thành công</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">
                    {stats.payments.success}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiXCircle className="text-red-500" size={20} />
                    <span className="text-gray-700 font-medium">Thất bại</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.payments.failed}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiClock className="text-yellow-500" size={20} />
                    <span className="text-gray-700 font-medium">Đang chờ</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {stats.payments.pending}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Tổng số giao dịch</span>
                    <span className="text-xl font-bold text-gray-800">
                      {stats.payments.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Tổng doanh thu</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(stats.payments.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Verification Status */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiUserCheck className="text-green-500" />
              Trạng thái Xác thực Bác sĩ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-500" size={24} />
                    <span className="text-gray-700 font-medium">Đã xác thực</span>
                  </div>
                  <span className="text-3xl font-bold text-green-600">
                    {stats.verifiedDoctors}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.doctors > 0 
                    ? `${Math.round((stats.verifiedDoctors / stats.doctors) * 100)}% tổng số bác sĩ`
                    : '0% tổng số bác sĩ'}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiAlertCircle className="text-yellow-500" size={24} />
                    <span className="text-gray-700 font-medium">Chưa xác thực</span>
                  </div>
                  <span className="text-3xl font-bold text-yellow-600">
                    {stats.unverifiedDoctors}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.doctors > 0 
                    ? `${Math.round((stats.unverifiedDoctors / stats.doctors) * 100)}% tổng số bác sĩ`
                    : '0% tổng số bác sĩ'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiActivity className="text-blue-500" />
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <FiActivity className="text-blue-500" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Hệ thống đang hoạt động bình thường</p>
                  <p className="text-sm text-gray-500">Tất cả các module đã được tải thành công</p>
                </div>
              </div>
              {stats.doctorRequests.pending > 0 && (
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <FiClock className="text-orange-500" size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      Có {stats.doctorRequests.pending} yêu cầu bác sĩ đang chờ xử lý
                    </p>
                    <p className="text-sm text-gray-500">
                      Vui lòng kiểm tra và phê duyệt các yêu cầu mới
                    </p>
                  </div>
                </div>
              )}
              {stats.unverifiedDoctors > 0 && (
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <FiAlertCircle className="text-yellow-500" size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      Có {stats.unverifiedDoctors} bác sĩ chưa được xác thực
                    </p>
                    <p className="text-sm text-gray-500">
                      Cần xác thực để bác sĩ có thể sử dụng hệ thống
                    </p>
                  </div>
                </div>
              )}
              {stats.payments.pending > 0 && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <FiClock className="text-blue-500" size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      Có {stats.payments.pending} giao dịch thanh toán đang chờ xử lý
                    </p>
                    <p className="text-sm text-gray-500">
                      Kiểm tra và cập nhật trạng thái thanh toán
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

