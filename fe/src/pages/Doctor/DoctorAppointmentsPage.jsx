import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Mock data - sẽ thay bằng GraphQL sau
const mockAppointments = [
  {
    id: 1,
    patientName: 'Nguyễn Văn A',
    familyName: 'Gia đình Nguyễn',
    date: '2024-11-15',
    time: '09:00',
    status: 'confirmed',
    reason: 'Khám định kỳ',
  },
  {
    id: 2,
    patientName: 'Trần Thị B',
    familyName: 'Gia đình Trần',
    date: '2024-11-15',
    time: '10:30',
    status: 'pending',
    reason: 'Tái khám',
  },
  {
    id: 3,
    patientName: 'Lê Văn C',
    familyName: 'Gia đình Lê',
    date: '2024-11-16',
    time: '14:00',
    status: 'confirmed',
    reason: 'Xem kết quả xét nghiệm',
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'confirmed':
      return 'Đã xác nhận';
    case 'pending':
      return 'Chờ xác nhận';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

export default function DoctorAppointmentsPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Lịch hẹn</Typography>
        <Button variant="contained" color="primary">
          Tạo lịch hẹn mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bệnh nhân</TableCell>
              <TableCell>Gia đình</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Giờ</TableCell>
              <TableCell>Lý do</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockAppointments.map((appointment) => (
              <TableRow key={appointment.id} hover>
                <TableCell>{appointment.patientName}</TableCell>
                <TableCell>{appointment.familyName}</TableCell>
                <TableCell>{new Date(appointment.date).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{appointment.reason}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(appointment.status)}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {mockAppointments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="textSecondary">Không có lịch hẹn nào</Typography>
        </Box>
      )}
    </Box>
  );
}
