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
  FiTrendingUp,
  FiHeart,
  FiHome,
  FiCreditCard,
  FiBarChart2,
  FiUserPlus,
  FiShield
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
          pending: doctorRequests.filter(r => {
            const s = r.status?.toUpperCase();
            return s === 'PENDING';
          }).length,
          accepted: doctorRequests.filter(r => {
            const s = r.status?.toUpperCase();
            return s === 'ACCEPTED';
          }).length,
          rejected: doctorRequests.filter(r => {
            const s = r.status?.toUpperCase();
            return s === 'REJECTED';
          }).length,
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
      icon: FiHeart,
      color: 'bg-[rgb(25,118,210)]',
      textColor: 'text-[rgb(25,118,210)]',
      bgGradient: 'from-[rgba(25,118,210,0.1)] to-[rgba(25,118,210,0.05)]',
    },
    {
      title: 'Tổng Bác sĩ',
      value: stats.doctors,
      icon: FiUserCheck,
      color: 'bg-[rgb(25,118,210)]',
      textColor: 'text-[rgb(25,118,210)]',
      subtitle: `${stats.verifiedDoctors} đã xác thực`,
      bgGradient: 'from-[rgba(25,118,210,0.1)] to-[rgba(25,118,210,0.05)]',
    },
    {
      title: 'Tổng Gia đình',
      value: stats.families,
      icon: FiHome,
      color: 'bg-[rgb(25,118,210)]',
      textColor: 'text-[rgb(25,118,210)]',
      bgGradient: 'from-[rgba(25,118,210,0.1)] to-[rgba(25,118,210,0.05)]',
    },
    {
      title: 'Yêu cầu Bác sĩ',
      value: stats.doctorRequests.total,
      icon: FiFileText,
      color: 'bg-[rgb(25,118,210)]',
      textColor: 'text-[rgb(25,118,210)]',
      subtitle: `${stats.doctorRequests.pending} đang chờ`,
      bgGradient: 'from-[rgba(25,118,210,0.1)] to-[rgba(25,118,210,0.05)]',
    },
    {
      title: 'Tổng Thanh toán',
      value: stats.payments.total,
      icon: FiCreditCard,
      color: 'bg-[rgb(25,118,210)]',
      textColor: 'text-[rgb(25,118,210)]',
      subtitle: `${stats.payments.success} thành công`,
      bgGradient: 'from-[rgba(25,118,210,0.1)] to-[rgba(25,118,210,0.05)]',
    },
    {
      title: 'Doanh thu',
      value: new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(stats.payments.totalAmount),
      icon: FiTrendingUp,
      color: 'bg-[rgb(25,118,210)]',
      textColor: 'text-[rgb(25,118,210)]',
      subtitle: 'Tổng doanh thu',
      bgGradient: 'from-[rgba(25,118,210,0.1)] to-[rgba(25,118,210,0.05)]',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-[rgb(25,118,210)] p-3 rounded-xl shadow-lg">
            <FiBarChart2 className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'rgb(25, 118, 210)' }}>Bảng điều khiển Admin</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <FiActivity size={16} />
              Tổng quan hệ thống quản lý y tế gia đình
            </p>
          </div>
        </div>
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
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[rgba(25,118,210,0.3)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`${stat.color} p-2 rounded-lg`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      </div>
                      <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <FiBarChart2 size={12} />
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={`${stat.color} p-5 rounded-xl shadow-lg`}>
                      <Icon size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Doctor Requests Statistics */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-[rgba(25,118,210,0.1)] p-2 rounded-lg">
                  <FiFileText style={{ color: 'rgb(25, 118, 210)' }} size={24} />
                </div>
                Thống kê Yêu cầu Bác sĩ
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <FiClock className="text-white" size={20} />
                    </div>
                    <span className="text-gray-700 font-medium">Đang chờ xử lý</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {stats.doctorRequests.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <FiCheckCircle className="text-white" size={20} />
                    </div>
                    <span className="text-gray-700 font-medium">Đã chấp nhận</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {stats.doctorRequests.accepted}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded-lg">
                      <FiXCircle className="text-white" size={20} />
                    </div>
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
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-[rgba(25,118,210,0.1)] p-2 rounded-lg">
                  <FiDollarSign style={{ color: 'rgb(25, 118, 210)' }} size={24} />
                </div>
                Thống kê Thanh toán
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-lg">
                      <FiCheckCircle className="text-white" size={20} />
                    </div>
                    <span className="text-gray-700 font-medium">Thành công</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">
                    {stats.payments.success}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded-lg">
                      <FiXCircle className="text-white" size={20} />
                    </div>
                    <span className="text-gray-700 font-medium">Thất bại</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.payments.failed}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 p-2 rounded-lg">
                      <FiClock className="text-white" size={20} />
                    </div>
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
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-[rgba(25,118,210,0.1)] p-2 rounded-lg">
                <FiShield style={{ color: 'rgb(25, 118, 210)' }} size={24} />
              </div>
              Trạng thái Xác thực Bác sĩ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-green-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-3 rounded-lg">
                      <FiCheckCircle className="text-white" size={24} />
                    </div>
                    <span className="text-gray-700 font-semibold text-lg">Đã xác thực</span>
                  </div>
                  <span className="text-3xl font-bold text-green-600">
                    {stats.verifiedDoctors}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-green-500" size={14} />
                  <p className="text-sm text-gray-500">
                    {stats.doctors > 0 
                      ? `${Math.round((stats.verifiedDoctors / stats.doctors) * 100)}% tổng số bác sĩ`
                      : '0% tổng số bác sĩ'}
                  </p>
                </div>
              </div>
              <div className="p-5 bg-yellow-50 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 p-3 rounded-lg">
                      <FiAlertCircle className="text-white" size={24} />
                    </div>
                    <span className="text-gray-700 font-semibold text-lg">Chưa xác thực</span>
                  </div>
                  <span className="text-3xl font-bold text-yellow-600">
                    {stats.unverifiedDoctors}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-yellow-500" size={14} />
                  <p className="text-sm text-gray-500">
                    {stats.doctors > 0 
                      ? `${Math.round((stats.unverifiedDoctors / stats.doctors) * 100)}% tổng số bác sĩ`
                      : '0% tổng số bác sĩ'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-[rgba(25,118,210,0.1)] p-2 rounded-lg">
                <FiActivity style={{ color: 'rgb(25, 118, 210)' }} size={24} />
              </div>
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[rgba(25,118,210,0.05)] rounded-lg border-l-4 border-[rgb(25,118,210)]">
                <div className="bg-[rgb(25,118,210)] p-2 rounded-lg">
                  <FiCheckCircle className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Hệ thống đang hoạt động bình thường</p>
                  <p className="text-sm text-gray-500">Tất cả các module đã được tải thành công</p>
                </div>
              </div>
              {stats.doctorRequests.pending > 0 && (
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <FiClock className="text-white" size={20} />
                  </div>
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
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
                  <div className="bg-yellow-500 p-2 rounded-lg">
                    <FiAlertCircle className="text-white" size={20} />
                  </div>
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
                <div className="flex items-center gap-4 p-4 rounded-lg border-l-4" style={{ backgroundColor: 'rgba(25, 118, 210, 0.1)', borderColor: 'rgb(25, 118, 210)' }}>
                  <div className="bg-[rgb(25,118,210)] p-2 rounded-lg">
                    <FiClock className="text-white" size={20} />
                  </div>
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

