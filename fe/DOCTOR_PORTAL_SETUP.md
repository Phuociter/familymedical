# 🏥 Hướng dẫn cài đặt Doctor Portal

## Bước 1: Cài đặt dependencies

Chạy lệnh sau trong terminal:

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-data-grid
```

## Bước 2: Cấu trúc đã tạo

### Pages (src/pages/Doctor/)
- ✅ `DoctorDashboard.jsx` - Dashboard với thống kê
- ✅ `DoctorFamiliesPage.jsx` - Quản lý gia đình & hồ sơ bệnh án  
- ✅ `DoctorMessagesPage.jsx` - Tin nhắn
- ✅ `DoctorAppointmentsPage.jsx` - Lịch hẹn

### Components (src/components/Doctor/)
- ✅ `DoctorLayout.jsx` - Layout với Drawer & AppBar
- ✅ `MemberList.jsx` - Danh sách thành viên
- ✅ `MedicalRecordList.jsx` - Danh sách hồ sơ bệnh án

### Theme
- ✅ `src/theme/doctorTheme.js` - MUI Theme configuration

### App.js
- ✅ Đã cập nhật routing cho Doctor Portal
- ✅ Tích hợp MUI ThemeProvider cho routes `/doctor/*`
- ✅ Module gia đình vẫn giữ nguyên Tailwind CSS

## Bước 3: Chạy ứng dụng

```bash
npm start
```

## Bước 4: Đăng nhập

1. Truy cập: `http://localhost:3000/login`
2. Đăng nhập với tài khoản bác sĩ (role: 'BacSi')
3. Sẽ tự động chuyển đến: `/doctor/dashboard`

## 🎯 Routes Doctor Portal

| Route | Mô tả |
|-------|-------|
| `/doctor/dashboard` | Dashboard với thống kê tổng quan |
| `/doctor/families` | Quản lý gia đình được phân công |
| `/doctor/messages` | Tin nhắn với bệnh nhân |
| `/doctor/appointments` | Quản lý lịch hẹn |

## 🎨 Tính năng chính

### Dashboard
- 📊 Thống kê: Tổng gia đình, bệnh nhân, hồ sơ mới, lịch hẹn
- 📈 Hoạt động gần đây
- 🔔 Thông báo

### Quản lý Gia đình
- 🔍 Tìm kiếm gia đình
- 👨‍👩‍👧‍👦 Xem danh sách gia đình được phân công
- 👤 Xem chi tiết thành viên
- 📋 Xem hồ sơ bệnh án chi tiết

### Tin nhắn
- 💬 Danh sách cuộc trò chuyện
- ✉️ Chat interface (UI đã sẵn sàng)

### Lịch hẹn
- 📅 Danh sách lịch hẹn
- ✅ Quản lý trạng thái (Đã xác nhận, Chờ xác nhận, Đã hủy)
- 🆕 Tạo lịch hẹn mới (UI đã sẵn sàng)

## 🔧 GraphQL Queries đã sử dụng

Tất cả queries đã có sẵn trong `src/graphql/doctorQueries.js`:

- `GET_ASSIGNED_FAMILIES` - Lấy danh sách gia đình
- `GET_FAMILY_MEMBERS` - Lấy thành viên gia đình
- `GET_MEMBER_MEDICAL_RECORDS` - Lấy hồ sơ bệnh án

## 📱 Responsive Design

- ✅ Mobile-friendly với MUI Drawer
- ✅ Responsive Grid layout
- ✅ Adaptive navigation

## 🎨 UI/UX Features

- Material Design 3
- Smooth transitions
- Loading states
- Error handling
- Empty states
- Breadcrumb navigation
- Search functionality
- Card-based layouts

## 🔐 Authentication

- Redux state management
- Token-based authentication
- Auto-redirect based on role
- Logout functionality

## 📝 Lưu ý

1. **Module tách biệt**: Doctor Portal sử dụng MUI, không ảnh hưởng đến module gia đình (Tailwind CSS)
2. **Theme riêng**: Doctor Portal có theme MUI riêng trong `src/theme/doctorTheme.js`
3. **Mock data**: Một số tính năng (Messages, Appointments) đang dùng mock data, cần tích hợp GraphQL sau
4. **Backend**: Đảm bảo backend GraphQL API đã implement các queries trong `doctorQueries.js`

## 🚀 Next Steps

1. Tích hợp GraphQL mutations cho:
   - Tạo/sửa/xóa lịch hẹn
   - Thêm/sửa hồ sơ bệnh án
   - Gửi tin nhắn

2. Thêm tính năng:
   - Real-time notifications
   - File upload cho hồ sơ bệnh án
   - Export báo cáo PDF
   - Calendar view cho lịch hẹn

3. Tối ưu:
   - Pagination cho danh sách
   - Caching strategy
   - Performance optimization

## ❓ Troubleshooting

### Lỗi: "Cannot find module '@mui/material'"
```bash
npm install @mui/material @emotion/react @emotion/styled
```

### Lỗi: "Cannot find module '@mui/icons-material'"
```bash
npm install @mui/icons-material
```

### Không redirect đến /doctor/dashboard sau khi login
- Kiểm tra role trong response: phải là 'BacSi'
- Kiểm tra Redux store có lưu đúng token không
- Xem console log trong `LoginPage.jsx`

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. Console log trong browser DevTools
2. Network tab để xem GraphQL requests
3. Redux DevTools để xem state
