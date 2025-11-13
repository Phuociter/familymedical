import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * AddMemberModal component - Modal for adding new family members
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onSave - Callback to save new member
 * @param {string} props.familyId - Family ID
 */
export default function AddMemberModal({ open, onClose, onSave, familyId }) {
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    cccd: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    healthStatus: 'normal',
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  const handleClose = () => {
    setFormData({
      fullName: '',
      relationship: '',
      cccd: '',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      email: '',
      healthStatus: 'normal',
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Vui lòng chọn mối quan hệ';
    }

    if (!formData.cccd.trim()) {
      newErrors.cccd = 'Vui lòng nhập CCCD';
    } else if (!/^\d{12}$/.test(formData.cccd)) {
      newErrors.cccd = 'CCCD phải có 12 chữ số';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    }

    if (!formData.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
    }

    if (formData.phoneNumber && !/^0\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Generate a temporary ID (in real app, this would come from backend)
      const newMember = {
        ...formData,
        memberID: `temp-${Date.now()}`,
        familyID: familyId,
        recentVisitCount: 0,
      };
      onSave(newMember);
      handleClose();
    }
  };

  const relationshipOptions = [
    'Chủ hộ',
    'Vợ',
    'Chồng',
    'Con trai',
    'Con gái',
    'Cha',
    'Mẹ',
    'Anh trai',
    'Chị gái',
    'Em trai',
    'Em gái',
    'Ông',
    'Bà',
    'Cháu trai',
    'Cháu gái',
    'Khác',
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Thêm thành viên mới</Typography>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 0.5, color: 'text.secondary' }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2.5}>
            {/* Full Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
              />
            </Grid>

            {/* Relationship */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Mối quan hệ"
                value={formData.relationship}
                onChange={handleChange('relationship')}
                error={!!errors.relationship}
                helperText={errors.relationship}
                required
              >
                {relationshipOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* CCCD */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số CCCD"
                value={formData.cccd}
                onChange={handleChange('cccd')}
                error={!!errors.cccd}
                helperText={errors.cccd}
                required
                inputProps={{ maxLength: 12 }}
              />
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày sinh"
                value={formData.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Giới tính"
                value={formData.gender}
                onChange={handleChange('gender')}
                error={!!errors.gender}
                helperText={errors.gender}
                required
              >
                <MenuItem value="Nam">Nam</MenuItem>
                <MenuItem value="Nữ">Nữ</MenuItem>
              </TextField>
            </Grid>

            {/* Health Status */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tình trạng sức khỏe"
                value={formData.healthStatus}
                onChange={handleChange('healthStatus')}
              >
                <MenuItem value="normal">Bình thường</MenuItem>
                <MenuItem value="monitoring">Theo dõi</MenuItem>
                <MenuItem value="active">Đang điều trị</MenuItem>
              </TextField>
            </Grid>

            {/* Phone Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                placeholder="0901234567"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="example@email.com"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ textTransform: 'none', minWidth: 100 }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
