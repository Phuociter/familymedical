/**
 * @file Mock data for doctor dashboard
 * This file provides comprehensive mock data for the dashboard
 */

export const MOCK_DASHBOARD_DATA = {
  todayAppointmentsCount: 8,
  pendingRequestsCount: 4,
  assignedFamiliesCount: 12,
  totalPatientsCount: 45,
  
  // Today's appointments
  todayAppointments: [
    {
      appointmentID: 'APT001',
      title: 'Khám định kỳ',
      type: 'Khám tổng quát',
      appointmentDateTime: new Date().toISOString().split('T')[0] + 'T09:00:00',
      member: {
        memberID: 'M001',
        fullName: 'Nguyễn Văn An',
      }
    },
    {
      appointmentID: 'APT002',
      title: 'Tái khám',
      type: 'Tái khám',
      appointmentDateTime: new Date().toISOString().split('T')[0] + 'T10:30:00',
      member: {
        memberID: 'M002',
        fullName: 'Trần Thị Bình',
      }
    },
    {
      appointmentID: 'APT003',
      title: 'Tư vấn dinh dưỡng',
      type: 'Tư vấn',
      appointmentDateTime: new Date().toISOString().split('T')[0] + 'T14:00:00',
      member: {
        memberID: 'M003',
        fullName: 'Lê Minh Châu',
      }
    },
    {
      appointmentID: 'APT004',
      title: 'Khám bệnh',
      type: 'Khám bệnh',
      appointmentDateTime: new Date().toISOString().split('T')[0] + 'T15:30:00',
      member: {
        memberID: 'M004',
        fullName: 'Phạm Thị Dung',
      }
    },
  ],

  // Weekly statistics
  weeklyStats: [
    {
      date: getDateDaysAgo(6),
      appointmentsCount: 5,
      consultationsCount: 3,
    },
    {
      date: getDateDaysAgo(5),
      appointmentsCount: 7,
      consultationsCount: 4,
    },
    {
      date: getDateDaysAgo(4),
      appointmentsCount: 4,
      consultationsCount: 2,
    },
    {
      date: getDateDaysAgo(3),
      appointmentsCount: 8,
      consultationsCount: 5,
    },
    {
      date: getDateDaysAgo(2),
      appointmentsCount: 6,
      consultationsCount: 4,
    },
    {
      date: getDateDaysAgo(1),
      appointmentsCount: 9,
      consultationsCount: 6,
    },
    {
      date: getDateDaysAgo(0),
      appointmentsCount: 8,
      consultationsCount: 5,
    },
  ],

  // Recent medical records
  recentMedicalRecords: [
    {
      recordID: 'REC001',
      diagnosis: 'Viêm họng cấp',
      recordDate: getDateDaysAgo(1),
      member: {
        memberID: 'M005',
        fullName: 'Hoàng Văn Em',
      }
    },
    {
      recordID: 'REC002',
      diagnosis: 'Cao huyết áp',
      recordDate: getDateDaysAgo(2),
      member: {
        memberID: 'M006',
        fullName: 'Vũ Thị Phương',
      }
    },
    {
      recordID: 'REC003',
      diagnosis: 'Đau dạ dày',
      recordDate: getDateDaysAgo(3),
      member: {
        memberID: 'M007',
        fullName: 'Đỗ Minh Quân',
      }
    },
    {
      recordID: 'REC004',
      diagnosis: 'Cảm cúm',
      recordDate: getDateDaysAgo(4),
      member: {
        memberID: 'M008',
        fullName: 'Bùi Thị Hoa',
      }
    },
  ],
};

// Helper function to get date X days ago in ISO format
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const getMockDashboardData = () => {
  return MOCK_DASHBOARD_DATA;
};
