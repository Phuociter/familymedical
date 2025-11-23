/**
 * @file Mock data for appointments
 */

// Helper function to get date
function getDate(daysOffset, hour, minute) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const MOCK_APPOINTMENTS = [
  // Today
  {
    appointmentID: 'APT001',
    familyID: 'FAM001',
    familyName: 'Gia đình Nguyễn Văn A',
    memberID: 'M001',
    memberName: 'Nguyễn Văn An',
    memberAge: 45,
    memberGender: 'Nam',
    title: 'Khám định kỳ',
    type: 'Khám tổng quát',
    appointmentDateTime: getDate(0, 9, 0),
    duration: 30,
    status: 'CONFIRMED',
    notes: 'Kiểm tra sức khỏe định kỳ 6 tháng',
    location: 'Phòng khám 101',
    createdAt: getDate(-7, 10, 0),
  },
  {
    appointmentID: 'APT002',
    familyID: 'FAM002',
    familyName: 'Gia đình Trần Thị B',
    memberID: 'M002',
    memberName: 'Trần Thị Bình',
    memberAge: 32,
    memberGender: 'Nữ',
    title: 'Tái khám',
    type: 'Tái khám',
    appointmentDateTime: getDate(0, 10, 30),
    duration: 30,
    status: 'CONFIRMED',
    notes: 'Tái khám sau điều trị viêm họng',
    location: 'Phòng khám 101',
    createdAt: getDate(-5, 14, 0),
  },
  {
    appointmentID: 'APT003',
    familyID: 'FAM003',
    familyName: 'Gia đình Lê Minh C',
    memberID: 'M003',
    memberName: 'Lê Minh Châu',
    memberAge: 28,
    memberGender: 'Nữ',
    title: 'Tư vấn dinh dưỡng',
    type: 'Tư vấn',
    appointmentDateTime: getDate(0, 14, 0),
    duration: 45,
    status: 'CONFIRMED',
    notes: 'Tư vấn chế độ ăn cho người tiểu đường',
    location: 'Phòng tư vấn 203',
    createdAt: getDate(-3, 9, 0),
  },
  {
    appointmentID: 'APT004',
    familyID: 'FAM004',
    familyName: 'Gia đình Phạm Thị D',
    memberID: 'M004',
    memberName: 'Phạm Thị Dung',
    memberAge: 55,
    memberGender: 'Nữ',
    title: 'Khám bệnh',
    type: 'Khám bệnh',
    appointmentDateTime: getDate(0, 15, 30),
    duration: 30,
    status: 'PENDING',
    notes: 'Đau đầu kéo dài 3 ngày',
    location: 'Phòng khám 102',
    createdAt: getDate(-1, 16, 0),
  },

  // Tomorrow
  {
    appointmentID: 'APT005',
    familyID: 'FAM005',
    familyName: 'Gia đình Hoàng Văn E',
    memberID: 'M005',
    memberName: 'Hoàng Văn Em',
    memberAge: 12,
    memberGender: 'Nam',
    title: 'Tiêm phòng',
    type: 'Tiêm chủng',
    appointmentDateTime: getDate(1, 9, 0),
    duration: 15,
    status: 'CONFIRMED',
    notes: 'Tiêm vắc xin phòng cúm',
    location: 'Phòng tiêm chủng',
    createdAt: getDate(-2, 11, 0),
  },
  {
    appointmentID: 'APT006',
    familyID: 'FAM006',
    familyName: 'Gia đình Vũ Thị F',
    memberID: 'M006',
    memberName: 'Vũ Thị Phương',
    memberAge: 60,
    memberGender: 'Nữ',
    title: 'Khám tim mạch',
    type: 'Khám chuyên khoa',
    appointmentDateTime: getDate(1, 10, 0),
    duration: 45,
    status: 'CONFIRMED',
    notes: 'Theo dõi cao huyết áp',
    location: 'Phòng khám 103',
    createdAt: getDate(-4, 15, 0),
  },

  // Next week
  {
    appointmentID: 'APT007',
    familyID: 'FAM007',
    familyName: 'Gia đình Đỗ Minh G',
    memberID: 'M007',
    memberName: 'Đỗ Minh Quân',
    memberAge: 38,
    memberGender: 'Nam',
    title: 'Khám dạ dày',
    type: 'Khám chuyên khoa',
    appointmentDateTime: getDate(3, 14, 0),
    duration: 30,
    status: 'CONFIRMED',
    notes: 'Đau dạ dày thường xuyên',
    location: 'Phòng khám 104',
    createdAt: getDate(-6, 10, 0),
  },
  {
    appointmentID: 'APT008',
    familyID: 'FAM008',
    familyName: 'Gia đình Bùi Thị H',
    memberID: 'M008',
    memberName: 'Bùi Thị Hoa',
    memberAge: 25,
    memberGender: 'Nữ',
    title: 'Khám thai',
    type: 'Khám sản',
    appointmentDateTime: getDate(5, 9, 30),
    duration: 30,
    status: 'PENDING',
    notes: 'Khám thai 3 tháng',
    location: 'Phòng khám sản',
    createdAt: getDate(-1, 14, 30),
  },

  // Past appointments
  {
    appointmentID: 'APT009',
    familyID: 'FAM001',
    familyName: 'Gia đình Nguyễn Văn A',
    memberID: 'M009',
    memberName: 'Nguyễn Thị Mai',
    memberAge: 40,
    memberGender: 'Nữ',
    title: 'Khám da liễu',
    type: 'Khám chuyên khoa',
    appointmentDateTime: getDate(-2, 10, 0),
    duration: 30,
    status: 'COMPLETED',
    notes: 'Điều trị mụn trứng cá',
    location: 'Phòng khám 105',
    createdAt: getDate(-10, 9, 0),
  },
  {
    appointmentID: 'APT010',
    familyID: 'FAM002',
    familyName: 'Gia đình Trần Thị B',
    memberID: 'M010',
    memberName: 'Trần Văn Nam',
    memberAge: 8,
    memberGender: 'Nam',
    title: 'Khám nhi',
    type: 'Khám nhi',
    appointmentDateTime: getDate(-5, 14, 30),
    duration: 30,
    status: 'COMPLETED',
    notes: 'Sốt cao 3 ngày',
    location: 'Phòng khám nhi',
    createdAt: getDate(-8, 16, 0),
  },
  {
    appointmentID: 'APT011',
    familyID: 'FAM003',
    familyName: 'Gia đình Lê Minh C',
    memberID: 'M011',
    memberName: 'Lê Văn Đức',
    memberAge: 30,
    memberGender: 'Nam',
    title: 'Khám răng',
    type: 'Khám răng hàm mặt',
    appointmentDateTime: getDate(-3, 15, 0),
    duration: 45,
    status: 'CANCELLED',
    notes: 'Bệnh nhân hủy do bận việc',
    location: 'Phòng nha khoa',
    createdAt: getDate(-7, 11, 0),
  },
];

export const APPOINTMENT_TYPES = [
  'Khám tổng quát',
  'Tái khám',
  'Tư vấn',
  'Khám bệnh',
  'Tiêm chủng',
  'Khám chuyên khoa',
  'Khám sản',
  'Khám nhi',
  'Khám răng hàm mặt',
];

export const APPOINTMENT_STATUS = {
  PENDING: { label: 'Chờ khám', color: 'warning' },
  SCHEDULED: { label: 'Sắp tới', color: 'info' },
  COMPLETED: { label: 'Đã khám', color: 'success' },
  CANCELLED: { label: 'Đã hủy', color: 'error' },
};

export const getMockAppointments = () => {
  return MOCK_APPOINTMENTS;
};

export const getAppointmentsByStatus = (status) => {
  return MOCK_APPOINTMENTS.filter(apt => apt.status === status);
};

export const getAppointmentsByDateRange = (startDate, endDate) => {
  return MOCK_APPOINTMENTS.filter(apt => {
    const aptDate = new Date(apt.appointmentDateTime);
    return aptDate >= startDate && aptDate <= endDate;
  });
};

export const getTodayAppointments = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getAppointmentsByDateRange(today, tomorrow);
};

export const getUpcomingAppointments = () => {
  const now = new Date();
  return MOCK_APPOINTMENTS.filter(apt => {
    const aptDate = new Date(apt.appointmentDateTime);
    return aptDate > now && apt.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));
};
