# Doctor Portal - Module Bác Sĩ

Module bác sĩ được xây dựng hoàn toàn với **Material-UI (MUI)**, tách biệt với module gia đình (sử dụng Tailwind CSS).

## 🎨 Công nghệ

- **Material-UI (MUI)** - UI Framework
- **Apollo Client** - GraphQL Client
- **React Router** - Routing
- **Redux** - State Management

## 📁 Cấu trúc

```
src/
├── pages/Doctor/
│   ├── DoctorDashboard.jsx          # Trang dashboard với thống kê
│   ├── DoctorFamiliesPage.jsx       # Quản lý gia đình & hồ sơ bệnh án
│   ├── DoctorMessagesPage.jsx       # Tin nhắn với bệnh nhân
│   └── DoctorAppointmentsPage.jsx   # Quản lý lịch hẹn
├── components/Doctor/
│   ├── DoctorLayout.jsx             # Layout chính với Drawer & AppBar
│   ├── MemberList.jsx               # Danh sách thành viên gia đình
│   └── MedicalRecordList.jsx        # Danh sách hồ sơ bệnh án
├── theme/
│   └── doctorTheme.js               # MUI Theme configuration
└── graphql/
    └── doctorQueries.js             # GraphQL queries
```

## 🚀 Tính năng

### 1. Dashboard
- Thống kê tổng quan (gia đình, bệnh nhân, hồ sơ mới, lịch hẹn)
- Hoạt động gần đây
- Thông báo

### 2. Quản lý Gia đình
- Danh sách gia đình được phân công
- Tìm kiếm gia đình
- Xem chi tiết thành viên
- Xem hồ sơ bệnh án của từng thành viên

### 3. Tin nhắn
- Danh sách cuộc trò chuyện
- Chat với bệnh nhân (đang phát triển)

### 4. Lịch hẹn
- Danh sách lịch hẹn
- Tạo lịch hẹn mới
- Quản lý trạng thái lịch hẹn

## 🔗 Routes

- `/doctor/dashboard` - Dashboard
- `/doctor/families` - Quản lý gia đình
- `/doctor/messages` - Tin nhắn
- `/doctor/appointments` - Lịch hẹn

## 📝 GraphQL Queries

### GET_ASSIGNED_FAMILIES
Lấy danh sách gia đình được phân công cho bác sĩ

### GET_FAMILY_MEMBERS
Lấy danh sách thành viên của một gia đình

### GET_MEMBER_MEDICAL_RECORDS
Lấy hồ sơ bệnh án của một thành viên

## 🎨 Theme

Theme MUI được cấu hình trong `src/theme/doctorTheme.js`:
- Primary color: `#1976d2` (Blue)
- Secondary color: `#dc004e` (Pink)
- Custom Drawer styling
- Typography configuration

## 🔐 Authentication

Module sử dụng Redux để quản lý authentication state:
- Token được lưu trong localStorage
- User info được lưu trong Redux store
- Logout sẽ clear cả localStorage và Redux state

## 📦 Dependencies

Cần cài đặt các package sau:

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-data-grid
```

## 🚧 Đang phát triển

- [ ] Chức năng chat realtime
- [ ] Tạo/sửa/xóa lịch hẹn
- [ ] Thêm/sửa hồ sơ bệnh án
- [ ] Thống kê chi tiết
- [ ] Export báo cáo
- [ ] Notifications realtime
