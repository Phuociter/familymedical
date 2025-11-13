/**
 * @file Mock data for doctor assignment requests
 * This file provides mock data for doctor request management feature
 */

export const MOCK_DOCTOR_REQUESTS = [
  // PENDING Requests
  {
    requestID: 'REQ001',
    familyID: '10',
    familyName: 'Gia đình Lê Văn Hùng',
    familyAddress: '45 Đường Trần Hưng Đạo, Phường 1, Quận 5, TP.HCM',
    requestDate: '2024-11-12T08:30:00',
    status: 'PENDING',
    message: 'Gia đình chúng tôi có người cao tuổi cần được theo dõi sức khỏe thường xuyên. Mong bác sĩ hỗ trợ.',
    responseDate: null,
    responseMessage: null,
    headOfFamily: {
      fullName: 'Lê Văn Hùng',
      phoneNumber: '0987654321',
      email: 'levanhung@email.com',
    },
    memberCount: 5,
  },
  {
    requestID: 'REQ002',
    familyID: '11',
    familyName: 'Gia đình Hoàng Thị Lan',
    familyAddress: '128 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP.HCM',
    requestDate: '2024-11-11T14:20:00',
    status: 'PENDING',
    message: 'Gia đình có trẻ nhỏ cần chăm sóc sức khỏe định kỳ.',
    responseDate: null,
    responseMessage: null,
    headOfFamily: {
      fullName: 'Hoàng Thị Lan',
      phoneNumber: '0976543210',
      email: 'hoanglan@email.com',
    },
    memberCount: 4,
  },
  {
    requestID: 'REQ003',
    familyID: '12',
    familyName: 'Gia đình Đặng Minh Quân',
    familyAddress: '67 Lê Văn Sỹ, Phường 14, Quận Phú Nhuận, TP.HCM',
    requestDate: '2024-11-10T16:45:00',
    status: 'PENDING',
    message: null,
    responseDate: null,
    responseMessage: null,
    headOfFamily: {
      fullName: 'Đặng Minh Quân',
      phoneNumber: '0965432109',
      email: null,
    },
    memberCount: 3,
  },
  {
    requestID: 'REQ004',
    familyID: '13',
    familyName: 'Gia đình Vũ Thị Hương',
    familyAddress: '234 Cách Mạng Tháng 8, Phường 10, Quận 3, TP.HCM',
    requestDate: '2024-11-09T10:15:00',
    status: 'PENDING',
    message: 'Chúng tôi cần bác sĩ tư vấn về chế độ dinh dưỡng cho người bệnh tiểu đường.',
    responseDate: null,
    responseMessage: null,
    headOfFamily: {
      fullName: 'Vũ Thị Hương',
      phoneNumber: '0954321098',
      email: 'vuhuong@email.com',
    },
    memberCount: 6,
  },

  // ACCEPTED Requests
  {
    requestID: 'REQ005',
    familyID: '14',
    familyName: 'Gia đình Ngô Văn Tùng',
    familyAddress: '89 Pasteur, Phường Bến Nghé, Quận 1, TP.HCM',
    requestDate: '2024-11-08T09:00:00',
    status: 'ACCEPTED',
    message: 'Gia đình có người bệnh mạn tính cần theo dõi.',
    responseDate: '2024-11-08T15:30:00',
    responseMessage: 'Tôi rất vui được đồng hành cùng gia đình. Sẽ liên hệ sớm để lên lịch khám.',
    headOfFamily: {
      fullName: 'Ngô Văn Tùng',
      phoneNumber: '0943210987',
      email: 'ngovantung@email.com',
    },
    memberCount: 4,
  },
  {
    requestID: 'REQ006',
    familyID: '15',
    familyName: 'Gia đình Bùi Thị Nga',
    familyAddress: '156 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM',
    requestDate: '2024-11-07T11:30:00',
    status: 'ACCEPTED',
    message: null,
    responseDate: '2024-11-07T16:00:00',
    responseMessage: 'Chào gia đình, tôi sẽ hỗ trợ chăm sóc sức khỏe cho mọi người.',
    headOfFamily: {
      fullName: 'Bùi Thị Nga',
      phoneNumber: '0932109876',
      email: 'buinga@email.com',
    },
    memberCount: 5,
  },
  {
    requestID: 'REQ007',
    familyID: '16',
    familyName: 'Gia đình Trương Văn Đức',
    familyAddress: '78 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM',
    requestDate: '2024-11-05T14:00:00',
    status: 'ACCEPTED',
    message: 'Gia đình cần bác sĩ tư vấn về sức khỏe sinh sản.',
    responseDate: '2024-11-06T09:00:00',
    responseMessage: 'Tôi có kinh nghiệm trong lĩnh vực này và sẵn sàng hỗ trợ gia đình.',
    headOfFamily: {
      fullName: 'Trương Văn Đức',
      phoneNumber: '0921098765',
      email: 'truongduc@email.com',
    },
    memberCount: 3,
  },
  {
    requestID: 'REQ008',
    familyID: '17',
    familyName: 'Gia đình Phan Thị Thanh',
    familyAddress: '345 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM',
    requestDate: '2024-11-04T08:45:00',
    status: 'ACCEPTED',
    message: 'Chúng tôi muốn có bác sĩ gia đình để chăm sóc sức khỏe toàn diện.',
    responseDate: '2024-11-04T17:20:00',
    responseMessage: 'Cảm ơn gia đình đã tin tưởng. Tôi sẽ cố gắng hết mình.',
    headOfFamily: {
      fullName: 'Phan Thị Thanh',
      phoneNumber: '0910987654',
      email: 'phanthanh@email.com',
    },
    memberCount: 7,
  },

  // REJECTED Requests
  {
    requestID: 'REQ009',
    familyID: '18',
    familyName: 'Gia đình Lý Văn Nam',
    familyAddress: '567 Nguyễn Đình Chiểu, Phường 5, Quận 3, TP.HCM',
    requestDate: '2024-11-03T10:00:00',
    status: 'REJECTED',
    message: 'Gia đình cần bác sĩ chuyên khoa tim mạch.',
    responseDate: '2024-11-03T14:30:00',
    responseMessage: 'Xin lỗi, chuyên môn của tôi không phù hợp với nhu cầu của gia đình. Tôi khuyên gia đình nên tìm bác sĩ chuyên khoa tim mạch.',
    headOfFamily: {
      fullName: 'Lý Văn Nam',
      phoneNumber: '0909876543',
      email: 'lyvannam@email.com',
    },
    memberCount: 4,
  },
  {
    requestID: 'REQ010',
    familyID: '19',
    familyName: 'Gia đình Mai Thị Hồng',
    familyAddress: '123 Võ Thị Sáu, Phường 7, Quận 3, TP.HCM',
    requestDate: '2024-11-02T15:30:00',
    status: 'REJECTED',
    message: null,
    responseDate: '2024-11-02T18:00:00',
    responseMessage: 'Hiện tại lịch làm việc của tôi đã đầy, không thể nhận thêm gia đình mới. Rất xin lỗi.',
    headOfFamily: {
      fullName: 'Mai Thị Hồng',
      phoneNumber: '0898765432',
      email: null,
    },
    memberCount: 5,
  },
  {
    requestID: 'REQ011',
    familyID: '20',
    familyName: 'Gia đình Đinh Văn Phong',
    familyAddress: '890 Trần Quốc Toản, Phường 8, Quận 3, TP.HCM',
    requestDate: '2024-10-30T09:15:00',
    status: 'REJECTED',
    message: 'Gia đình ở xa, cần bác sĩ có thể đến tận nhà.',
    responseDate: '2024-10-30T16:45:00',
    responseMessage: 'Khu vực của gia đình nằm ngoài phạm vi hoạt động của tôi. Xin lỗi vì sự bất tiện này.',
    headOfFamily: {
      fullName: 'Đinh Văn Phong',
      phoneNumber: '0887654321',
      email: 'dinhphong@email.com',
    },
    memberCount: 6,
  },
];

// Helper function to filter requests by status
export const getRequestsByStatus = (status) => {
  if (!status) return MOCK_DOCTOR_REQUESTS;
  return MOCK_DOCTOR_REQUESTS.filter(request => request.status === status);
};

// Helper function to get request by ID
export const getRequestById = (requestId) => {
  return MOCK_DOCTOR_REQUESTS.find(request => request.requestID === requestId);
};

// Statistics
export const MOCK_REQUEST_STATS = {
  total: MOCK_DOCTOR_REQUESTS.length,
  pending: MOCK_DOCTOR_REQUESTS.filter(r => r.status === 'PENDING').length,
  accepted: MOCK_DOCTOR_REQUESTS.filter(r => r.status === 'ACCEPTED').length,
  rejected: MOCK_DOCTOR_REQUESTS.filter(r => r.status === 'REJECTED').length,
};
