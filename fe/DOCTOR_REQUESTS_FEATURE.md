# Tính năng Quản lý Yêu cầu Phân công Bác sĩ

## 📋 Tổng quan

Tính năng này cho phép bác sĩ xem và phản hồi các yêu cầu phân công từ gia đình. Bác sĩ có thể chấp nhận hoặc từ chối yêu cầu với lời nhắn tùy chọn.

## 🚀 Cách sử dụng

### 1. Truy cập trang

Sau khi đăng nhập với tài khoản bác sĩ, truy cập:
```
http://localhost:3000/doctor/requests
```

Hoặc click vào menu **"Yêu cầu phân công"** trong sidebar.

### 2. Xem danh sách yêu cầu

Trang có 3 tab để lọc yêu cầu:
- **Chờ xử lý**: Các yêu cầu mới cần phản hồi
- **Đã chấp nhận**: Các yêu cầu đã chấp nhận
- **Đã từ chối**: Các yêu cầu đã từ chối

### 3. Phản hồi yêu cầu

Với mỗi yêu cầu ở trạng thái "Chờ xử lý", bạn có thể:

#### Chấp nhận yêu cầu:
1. Click nút **"Chấp nhận"** (màu xanh)
2. Nhập lời nhắn (tùy chọn)
3. Click **"Xác nhận chấp nhận"**

#### Từ chối yêu cầu:
1. Click nút **"Từ chối"** (màu đỏ)
2. Nhập lý do từ chối (tùy chọn)
3. Click **"Xác nhận từ chối"**

## 📁 Cấu trúc File

### 1. GraphQL Mutations & Queries
**File**: `src/graphql/doctorMutations.js`

```javascript
// Mutation để phản hồi yêu cầu
RESPOND_TO_DOCTOR_REQUEST

// Query để lấy danh sách yêu cầu
GET_DOCTOR_REQUESTS

// Query để lấy chi tiết yêu cầu
GET_DOCTOR_REQUEST_DETAIL
```

### 2. Component chính
**File**: `src/pages/Doctor/DoctorRequestsPage.jsx`

**Features**:
- Tab navigation (Chờ xử lý / Đã chấp nhận / Đã từ chối)
- Request cards với thông tin đầy đủ
- Dialog để phản hồi yêu cầu
- Loading states và error handling
- Auto-refresh sau khi phản hồi

### 3. Routes
**File**: `src/App.js`

Route mới: `/doctor/requests`

### 4. Navigation
**File**: `src/components/Doctor/DoctorLayout.jsx`

Menu item mới: "Yêu cầu phân công" với icon AssignmentInd

## 🎨 UI Components

### RequestCard
Hiển thị thông tin yêu cầu:
- Tên gia đình
- Địa chỉ
- Số lượng thành viên
- Thông tin chủ hộ (tên, SĐT, email)
- Ngày yêu cầu
- Lời nhắn từ gia đình
- Trạng thái (Chip với màu sắc)
- Nút hành động (Chấp nhận/Từ chối)

### ResponseDialog
Dialog để phản hồi yêu cầu:
- Hiển thị tên gia đình
- TextField để nhập lời nhắn/lý do
- Nút xác nhận với loading state
- Màu sắc khác nhau cho chấp nhận/từ chối

## 🔧 GraphQL Schema

### Mutation: respondToDoctorRequest

```graphql
mutation RespondToDoctorRequest(
  $requestId: ID!
  $status: RequestStatus!
  $message: String
) {
  respondToDoctorRequest(
    requestId: $requestId
    status: $status
    message: $message
  ) {
    requestID
    familyID
    familyName
    requestDate
    status
    message
    responseDate
    responseMessage
  }
}
```

**Parameters**:
- `requestId`: ID của yêu cầu (bắt buộc)
- `status`: Trạng thái phản hồi - `ACCEPTED` hoặc `REJECTED` (bắt buộc)
- `message`: Lời nhắn phản hồi (tùy chọn)

### Query: doctorRequests

```graphql
query GetDoctorRequests($status: RequestStatus) {
  doctorRequests(status: $status) {
    requestID
    familyID
    familyName
    familyAddress
    requestDate
    status
    message
    responseDate
    responseMessage
    headOfFamily {
      fullName
      phoneNumber
      email
    }
    memberCount
  }
}
```

**Parameters**:
- `status`: Lọc theo trạng thái - `PENDING`, `ACCEPTED`, hoặc `REJECTED` (tùy chọn)

## 🎯 Request Status

```javascript
const statusConfig = {
  PENDING: { 
    label: 'Chờ xử lý', 
    color: 'warning', 
    icon: <PendingIcon /> 
  },
  ACCEPTED: { 
    label: 'Đã chấp nhận', 
    color: 'success', 
    icon: <CheckCircleIcon /> 
  },
  REJECTED: { 
    label: 'Đã từ chối', 
    color: 'error', 
    icon: <CancelIcon /> 
  },
};
```

## 📱 Responsive Design

- Grid layout responsive (2 cột trên desktop, 1 cột trên mobile)
- Dialog full-width trên mobile
- Card layout tối ưu cho mọi kích thước màn hình

## 🔐 Authentication

- Yêu cầu đăng nhập với role `BacSi`
- Chỉ hiển thị yêu cầu được gửi đến bác sĩ đang đăng nhập

## 📝 Lưu ý Backend

Backend cần implement:

1. **Mutation `respondToDoctorRequest`**:
   - Validate requestId tồn tại
   - Validate bác sĩ có quyền phản hồi yêu cầu này
   - Cập nhật status và responseMessage
   - Lưu responseDate
   - Nếu ACCEPTED, tạo relationship giữa bác sĩ và gia đình

2. **Query `doctorRequests`**:
   - Lọc yêu cầu theo doctorId từ token
   - Hỗ trợ filter theo status
   - Trả về đầy đủ thông tin gia đình và chủ hộ

3. **Query `doctorRequestDetail`** (optional):
   - Trả về chi tiết đầy đủ của yêu cầu
   - Bao gồm danh sách thành viên gia đình

## 🚀 Next Steps

1. **Notifications**:
   - Thông báo real-time khi có yêu cầu mới
   - Badge hiển thị số yêu cầu chờ xử lý

2. **Analytics**:
   - Thống kê số yêu cầu theo thời gian
   - Tỷ lệ chấp nhận/từ chối

3. **Advanced Features**:
   - Xem chi tiết gia đình trước khi chấp nhận
   - Lọc và tìm kiếm yêu cầu
   - Export danh sách yêu cầu

## 🎨 Screenshots

### Tab "Chờ xử lý"
- Hiển thị các yêu cầu mới
- Nút "Chấp nhận" và "Từ chối" ở mỗi card

### Tab "Đã chấp nhận"
- Hiển thị các yêu cầu đã chấp nhận
- Hiển thị lời nhắn phản hồi của bác sĩ

### Tab "Đã từ chối"
- Hiển thị các yêu cầu đã từ chối
- Hiển thị lý do từ chối

### Dialog phản hồi
- Form nhập lời nhắn
- Nút xác nhận với màu sắc phù hợp
- Loading state khi đang xử lý
