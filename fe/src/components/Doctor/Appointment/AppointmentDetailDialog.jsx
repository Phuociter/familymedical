import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  IconButton,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { APPOINTMENT_STATUS } from '../../../mocks/appointmentsMockData';

export default function AppointmentDetailDialog({ open, appointment, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState(appointment.status);

  const handleUpdateStatus = () => {
    console.log('Updating status to:', editedStatus);
    // TODO: Call API to update status
    setIsEditing(false);
  };

  const handleCancel = () => {
    console.log('Cancelling appointment:', appointment.appointmentID);
    // TODO: Call API to cancel appointment
    onClose();
  };

  const handleComplete = () => {
    console.log('Completing appointment:', appointment.appointmentID);
    // TODO: Call API to complete appointment
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Chi tiết lịch hẹn
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Patient Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={`https://i.pravatar.cc/150?u=${appointment.memberID}`}
              alt={appointment.memberName}
              sx={{ width: 64, height: 64 }}
            />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {appointment.memberName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {appointment.memberAge} tuổi • {appointment.memberGender}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {appointment.familyName}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Appointment Details */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {appointment.title}
            </Typography>
            <Chip
              label={appointment.type}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            {isEditing ? (
              <TextField
                select
                size="small"
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                {Object.keys(APPOINTMENT_STATUS).map((status) => (
                  <MenuItem key={status} value={status}>
                    {APPOINTMENT_STATUS[status].label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Chip
                label={APPOINTMENT_STATUS[appointment.status].label}
                size="small"
                color={APPOINTMENT_STATUS[appointment.status].color}
              />
            )}
          </Box>

          {/* Time & Location */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="action" />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Thời gian
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {format(parseISO(appointment.appointmentDateTime), 'EEEE, dd MMMM yyyy • HH:mm', { locale: vi })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Thời lượng: {appointment.duration} phút
                </Typography>
              </Box>
            </Box>

            {appointment.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="action" />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Địa điểm
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {appointment.location}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Notes */}
          {appointment.notes && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Ghi chú
              </Typography>
              <Typography variant="body1">
                {appointment.notes}
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Created Date */}
          <Typography variant="caption" color="textSecondary">
            Tạo lúc: {format(parseISO(appointment.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
            <>
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)} color="inherit">
                    Hủy
                  </Button>
                  <Button onClick={handleUpdateStatus} variant="contained">
                    Lưu
                  </Button>
                </>
              ) : (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  color="inherit"
                >
                  Chỉnh sửa
                </Button>
              )}
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {appointment.status === 'CONFIRMED' && (
            <>
              <Button
                startIcon={<CheckCircleIcon />}
                onClick={handleComplete}
                variant="contained"
                color="success"
              >
                Hoàn thành
              </Button>
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                variant="outlined"
                color="error"
              >
                Hủy lịch
              </Button>
            </>
          )}
          {appointment.status === 'PENDING' && (
            <>
              <Button
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  setEditedStatus('CONFIRMED');
                  handleUpdateStatus();
                }}
                variant="contained"
                color="success"
              >
                Xác nhận
              </Button>
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                variant="outlined"
                color="error"
              >
                Từ chối
              </Button>
            </>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
