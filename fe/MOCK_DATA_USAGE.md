# Hướng dẫn sử dụng Mock Data - Doctor Requests

## 📋 Tổng quan

Tính năng quản lý yêu cầu phân công bác sĩ đã được tích hợp mock data để có thể test và phát triển mà không cần backend.

## 🎯 Cách hoạt động

### Auto-detect Backend
Component `DoctorRequestsPage` tự động phát hiện khi backend không khả dụng và chuyển sang sử dụng mock data:

```javascript
// Tự động chuyển sang mock data khi có lỗi fetch
useEffect(() => {
  if (error && error.message.includes('fetch')) {
    setUseMockData(true);
    console.log('Backend unavailable, using mock data');
  }
}, [error]);
```

### Mock Data Badge
Khi sử dụng mock data, một badge "Mock Data" màu xanh sẽ hiển thị ở góc trên bên phải trang để thông báo cho người dùng.

## 📊 Mock Data Structure

### File: `src/mocks/doctorRequestsMockData.js`

**Tổng cộng**: 11 yêu cầu mẫu
- **PENDING**: 4 yêu cầu chờ xử lý
- **ACCEPTED**: 4 yêu cầu đã chấp nhận
- **REJECTED**: 3 yêu cầu đã từ chối

### Sample Request Object

```javascript
{
  requestID: 'REQ001',
  familyID: '10',
  familyName: 'Gia đình Lê Văn Hùng',
  familyAddress: '45 Đường Trần Hưng Đạo, Phường 1, Quận 5, TP.HCM',
  requestDate: '2024-11-12T08:30:00',
  status: 'PENDING',
  message: 'Gia đình chúng tôi có người cao tuổi...',
  responseDate: null,
  responseMessage: null,
  headOfFamily: {
    fullName: 'Lê Văn Hùng',
    phoneNumber: '0987654321',
    email: 'levanhung@email.com',
  },
  memberCount: 5,
}
```

## 🔧 Tính năng Mock Data

### 1. Xem danh sách yêu cầu
- Lọc theo status (PENDING/ACCEPTED/REJECTED)
- Hiển thị đầy đủ thông tin gia đình
- Thông tin chủ hộ (tên, SĐT, email)

### 2. Phản hồi yêu cầu (Chấp nhận/Từ chối)
- Cập nhật status trong mock data
- Lưu responseMessage
- Tự động cập nhật responseDate
- UI cập nhật ngay lập tức

### 3. Dashboard Statistics
- Hiển thị số yêu cầu chờ xử lý
- Sử dụng `MOCK_REQUEST_STATS`

## 🚀 Cách sử dụng

### Chạy với Mock Data

1. **Không cần backend**: Chỉ cần chạy frontend
```bash
npm start
```

2. **Truy cập trang**:
```
http://localhost:3000/doctor/requests
```

3. **Test các tính năng**:
   - Xem danh sách yêu cầu ở 3 tab
   - Chấp nhận yêu cầu PENDING
   - Từ chối yêu cầu PENDING
   - Xem lịch sử phản hồi

### Chuyển đổi giữa Mock và Real Data

Component tự động chuyển đổi:
- **Mock Data**: Khi backend không khả dụng
- **Real Data**: Khi backend hoạt động bình thường

## 📝 Helper Functions

### getRequestsByStatus(status)
Lọc yêu cầu theo status:
```javascript
import { getRequestsByStatus } from '../../mocks/doctorRequestsMockData';

const pendingRequests = getRequestsByStatus('PENDING');
const acceptedRequests = getRequestsByStatus('ACCEPTED');
const rejectedRequests = getRequestsByStatus('REJECTED');
```

### getRequestById(requestId)
Lấy yêu cầu theo ID:
```javascript
import { getRequestById } from '../../mocks/doctorRequestsMockData';

const request = getRequestById('REQ001');
```

### MOCK_REQUEST_STATS
Thống kê tổng quan:
```javascript
import { MOCK_REQUEST_STATS } from '../../mocks/doctorRequestsMockData';

console.log(MOCK_REQUEST_STATS);
// {
//   total: 11,
//   pending: 4,
//   accepted: 4,
//   rejected: 3
// }
```

## 🎨 UI Features với Mock Data

### 1. Request Cards
- Hiển thị đầy đủ thông tin từ mock data
- Status chip với màu sắc phù hợp
- Nút hành động cho PENDING requests

### 2. Response Dialog
- Form nhập lời nhắn
- Cập nhật mock data khi submit
- Loading state simulation

### 3. Tab Navigation
- Lọc mock data theo status
- Cập nhật danh sách khi chuyển tab

## 🔄 State Management với Mock Data

```javascript
const [mockRequests, setMockRequests] = useState(MOCK_DOCTOR_REQUESTS);

// Cập nhật mock data khi phản hồi
const handleSubmitResponse = () => {
  if (useMockData) {
    const updatedRequests = mockRequests.map(req => {
      if (req.requestID === selectedRequest.requestID) {
        return {
          ...req,
          status: actionType,
          responseDate: new Date().toISOString(),
          responseMessage: responseMessage || null,
        };
      }
      return req;
    });
    setMockRequests(updatedRequests);
  }
};
```

## 📱 Dashboard Integration

Dashboard hiển thị số yêu cầu chờ xử lý từ mock data:

```javascript
import { MOCK_REQUEST_STATS } from '../../mocks/doctorRequestsMockData';

<StatCard
  title="Yêu cầu chờ xử lý"
  value={MOCK_REQUEST_STATS.pending}
  icon={<AssignmentIndIcon />}
  color="#f57c00"
/>
```

## 🧪 Testing Scenarios

### Scenario 1: Xem yêu cầu PENDING
1. Mở trang `/doctor/requests`
2. Tab "Chờ xử lý" hiển thị 4 yêu cầu
3. Mỗi card hiển thị đầy đủ thông tin

### Scenario 2: Chấp nhận yêu cầu
1. Click nút "Chấp nhận" trên request PENDING
2. Nhập lời nhắn (optional)
3. Click "Xác nhận chấp nhận"
4. Request chuyển sang tab "Đã chấp nhận"

### Scenario 3: Từ chối yêu cầu
1. Click nút "Từ chối" trên request PENDING
2. Nhập lý do (optional)
3. Click "Xác nhận từ chối"
4. Request chuyển sang tab "Đã từ chối"

### Scenario 4: Xem lịch sử
1. Chuyển sang tab "Đã chấp nhận"
2. Xem các yêu cầu đã chấp nhận với lời nhắn phản hồi
3. Chuyển sang tab "Đã từ chối"
4. Xem các yêu cầu đã từ chối với lý do

## 🔐 Data Persistence

**Lưu ý**: Mock data chỉ tồn tại trong session hiện tại:
- Dữ liệu sẽ reset khi refresh trang
- Không lưu vào localStorage
- Phù hợp cho development và testing

## 🚀 Chuyển sang Production

Khi backend sẵn sàng:
1. Implement GraphQL queries/mutations
2. Component tự động sử dụng real data
3. Mock data vẫn là fallback khi backend lỗi

## 📋 Mock Data Examples

### PENDING Request
```javascript
{
  requestID: 'REQ001',
  status: 'PENDING',
  message: 'Gia đình chúng tôi có người cao tuổi...',
  responseDate: null,
  responseMessage: null,
}
```

### ACCEPTED Request
```javascript
{
  requestID: 'REQ005',
  status: 'ACCEPTED',
  message: 'Gia đình có người bệnh mạn tính...',
  responseDate: '2024-11-08T15:30:00',
  responseMessage: 'Tôi rất vui được đồng hành cùng gia đình...',
}
```

### REJECTED Request
```javascript
{
  requestID: 'REQ009',
  status: 'REJECTED',
  message: 'Gia đình cần bác sĩ chuyên khoa tim mạch.',
  responseDate: '2024-11-03T14:30:00',
  responseMessage: 'Xin lỗi, chuyên môn của tôi không phù hợp...',
}
```

## 🎯 Best Practices

1. **Development**: Sử dụng mock data để phát triển UI/UX
2. **Testing**: Test các edge cases với mock data
3. **Demo**: Trình diễn tính năng mà không cần backend
4. **Fallback**: Mock data là backup khi backend lỗi

## 📞 Support

Nếu cần thêm mock data hoặc điều chỉnh:
1. Mở file `src/mocks/doctorRequestsMockData.js`
2. Thêm/sửa objects trong `MOCK_DOCTOR_REQUESTS`
3. Cập nhật `MOCK_REQUEST_STATS` nếu cần
