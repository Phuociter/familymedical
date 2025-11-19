import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
  Avatar,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { APPOINTMENT_TYPES } from '../../../mocks/appointmentsMockData';

// Mock patients data - In real app, fetch from API
const MOCK_PATIENTS = [
  { id: 'M001', name: 'Nguyễn Văn An', age: 45, gender: 'Nam', familyName: 'Gia đình Nguyễn Văn A' },
  { id: 'M002', name: 'Trần Thị Bình', age: 32, gender: 'Nữ', familyName: 'Gia đình Trần Thị B' },
  { id: 'M003', name: 'Lê Minh Châu', age: 28, gender: 'Nữ', familyName: 'Gia đình Lê Minh C' },
  { id: 'M004', name: 'Phạm Thị Dung', age: 55, gender: 'Nữ', familyName: 'Gia đình Phạm Thị D' },
  { id: 'M005', name: 'Hoàng Văn Em', age: 12, gender: 'Nam', familyName: 'Gia đình Hoàng Văn E' },
];

export default function CreateAppointmentDialog({ open, onClose }) {
  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30); // Round to nearest 30 min
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const [formData, setFormData] = useState({
    patient: null,
    title: '',
    type: '',
    appointmentDateTime: getDefaultDateTime(),
    duration: 30,
    location: '',
    notes: '',
  });

  const handleSubmit = () => {
    console.log('Creating appointment:', formData);
    // TODO: Call API to create appointment
    onClose();
    // Reset form
    setFormData({
      patient: null,
      title: '',
      type: '',
      appointmentDateTime: getDefaultDateTime(),
      duration: 30,
      location: '',
      notes: '',
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Tạo lịch hẹn mới
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Patient Selection */}
          <Autocomplete
            options={MOCK_PATIENTS}
            value={formData.patient}
            onChange={(e, value) => handleChange('patient', value)}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn bệnh nhân"
                required
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={`https://i.pravatar.cc/150?u=${option.id}`}
                  alt={option.name}
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.age} tuổi • {option.gender} • {option.familyName}
                  </Typography>
                </Box>
              </Box>
            )}
          />

          {/* Title */}
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            fullWidth
          />

          {/* Type */}
          <TextField
            select
            label="Loại lịch hẹn"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            required
            fullWidth
          >
            {APPOINTMENT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          {/* Date Time */}
          <TextField
            label="Ngày giờ hẹn"
            type="datetime-local"
            value={formData.appointmentDateTime}
            onChange={(e) => handleChange('appointmentDateTime', e.target.value)}
            required
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Duration */}
          <TextField
            select
            label="Thời gian (phút)"
            value={formData.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            fullWidth
          >
            <MenuItem value={15}>15 phút</MenuItem>
            <MenuItem value={30}>30 phút</MenuItem>
            <MenuItem value={45}>45 phút</MenuItem>
            <MenuItem value={60}>60 phút</MenuItem>
          </TextField>

          {/* Location */}
          <TextField
            label="Địa điểm"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            fullWidth
            placeholder="Phòng khám 101"
          />

          {/* Notes */}
          <TextField
            label="Ghi chú"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Thông tin bổ sung về lịch hẹn..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.patient || !formData.title || !formData.type}
        >
          Tạo lịch hẹn
        </Button>
      </DialogActions>
    </Dialog>
  );
}
