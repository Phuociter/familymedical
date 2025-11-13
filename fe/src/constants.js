export const FAMILY_MEMBERS = [
  { 
    id: 1, 
    name: 'Nguyễn Văn A', 
    relationship: 'Chủ hộ', 
    avatarColor: 'bg-blue-500',
    records: [
      { id: 101, name: 'Chest_X-Ray_Report.pdf', type: 'X-Quang', date: '2023-10-15' },
      { id: 102, name: 'Blood_Test_Results_Jan.pdf', type: 'Xét nghiệm máu', date: '2024-01-20' },
    ]
  },
  { id: 2, name: 'Trần Thị B', relationship: 'Vợ', avatarColor: 'bg-pink-500', records: [] },
  { id: 3, name: 'Nguyễn Văn C', relationship: 'Con trai', avatarColor: 'bg-green-500', records: [] },
  { id: 4, name: 'Nguyễn Thị D', relationship: 'Con gái', avatarColor: 'bg-yellow-500' },
  { id: 5, name: 'Lê Thị Dung', relationship: 'Mẹ', avatarColor: 'bg-purple-500' },
];

export const DOCTORS = [
    { id: 1, name: 'Nguyễn Văn A', specialty: 'Bác sĩ đa khoa', email: 'vana@example.com', phone: '0987654321', experience: '10 năm', hospital: 'Bệnh viện Bạch Mai', zaloLink: 'https://zalo.me/0987654321' },
    { id: 2, name: 'Trần Thị B', specialty: 'Bác sĩ đa khoa', email: 'thib@example.com', phone: '0987654322', experience: '8 năm', hospital: 'Bệnh viện Nhi Đồng 1', zaloLink: 'https://zalo.me/0987654322' },
    { id: 3, name: 'Phạm Ngọc C', specialty: 'Bác sĩ đa khoa', email: 'ngocc@example.com', phone: '0987654323', experience: '12 năm', hospital: 'Bệnh viện Chợ Rẫy', zaloLink: 'https://zalo.me/0987654323' },
    { id: 4, name: 'Ngô Đức D', specialty: 'Bác sĩ đa khoa', email: 'ducd@example.com', phone: '0987654324', experience: '5 năm', hospital: 'Bệnh viện 108', zaloLink: 'https://zalo.me/0987654324' },
    { id: 5, name: 'Lê Văn E', specialty: 'Bác sĩ đa khoa', email: 'vane@example.com', phone: '0987654325', experience: '7 năm', hospital: 'Bệnh viện Việt Đức', zaloLink: 'https://zalo.me/0987654325' },
    { id: 6, name: 'Vũ Thị F', specialty: 'Bác sĩ đa khoa', email: 'thif@example.com', phone: '0987654326', experience: '15 năm', hospital: 'Bệnh viện E', zaloLink: 'https://zalo.me/0987654326' },
];

export const USER_PROFILE = {
  name: 'Nguyễn Thúy Hà',
  email: 'Chưa có',
  phone: 'Chưa cập nhật',
  cccd: 'Chưa cập nhật',
  address: 'Chưa cập nhật',
  memberCount: 5,
  packageType: 'Chưa đăng ký',
  packageStatus: 'Chưa thanh toán',
  expiryDate: 'Chưa có',
  avatar: 'https://picsum.photos/100'
};
