import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { UPDATE_USER_PROFILE } from '../../../graphql/doctorMutations';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../../redux/userSlice';
import AvatarUpload from './AvatarUpload';
import axios from 'axios';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// Component TextBox tùy chỉnh để tái sử dụng
const FormField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  placeholder,
  multiline = false,
  rows = 1,
  error = null,
  helperText = '',
  type = 'text'
}) => (
  <Grid size={{ xs: 12, md: multiline ? 12 : 6 }}>
    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
      {label}
      {required && <span style={{ color: 'red' }}> *</span>}
    </Typography>
    <TextField
      fullWidth
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      multiline={multiline}
      rows={rows}
      type={type}
      error={error}
      helperText={helperText}
      sx={disabled ? {
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: '#999',
          bgcolor: '#f5f5f5',
        },
      } : {}}
    />
  </Grid>
);

const ProfileSettings = ({ user }) => {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    cccd: user?.cccd || '',
    doctorCode: user?.doctorCode || '',
    hospitalName: user?.hospitalName || '',
    yearsOfExperience: user?.yearsOfExperience || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [errors, setErrors] = useState({});
  const [updateUserProfile, { loading, error }] = useMutation(UPDATE_USER_PROFILE);
  const [success, setSuccess] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value || value.trim().length < 2) {
          return 'Họ tên phải có ít nhất 2 ký tự';
        }
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
        }
        break;
      
      case 'phoneNumber':
        if (value && !/^(\+84|0)[3|5|7|8|9][0-9]{8}$/.test(value)) {
          return 'Số điện thoại không hợp lệ (VD: 0912345678)';
        }
        break;
      
      case 'cccd':
        if (value && !/^[0-9]{9}$|^[0-9]{12}$/.test(value)) {
          return 'CCCD phải có 9 hoặc 12 chữ số';
        }
        break;
      
      case 'doctorCode':
        if (value && !/^[A-Z0-9]{5,20}$/.test(value)) {
          return 'Mã bác sĩ phải từ 5-20 ký tự viết hoa và số';
        }
        break;
      
      case 'hospitalName':
        if (value && (value.length < 2 || value.length > 255)) {
          return 'Tên bệnh viện phải từ 2-255 ký tự';
        }
        break;
      
      case 'yearsOfExperience':
        if (value && (!/^[0-9]{1,2}$/.test(value) || parseInt(value) > 99)) {
          return 'Số năm kinh nghiệm phải từ 0-99';
        }
        break;
      
      case 'address':
        if (value && value.length > 255) {
          return 'Địa chỉ không được vượt quá 255 ký tự';
        }
        break;
      
      default:
        break;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'email' && key !== 'avatarUrl') { // Skip email and avatarUrl validation
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let avatarUrl = formData.avatarUrl;

      // Upload avatar to Cloudinary if a new file is selected
      if (selectedAvatarFile) {
        setUploading(true);
        try {
          const formDataCloudinary = new FormData();
          formDataCloudinary.append('file', selectedAvatarFile);
          formDataCloudinary.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          formDataCloudinary.append('folder', 'avatars');

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formDataCloudinary
          );

          avatarUrl = response.data.secure_url;
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      // Update user profile with new data
      const { data } = await updateUserProfile({
        variables: {
          userID: user.userID,
          input: {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber || null,
            address: formData.address || null,
            cccd: formData.cccd || null,
            doctorCode: formData.doctorCode || null,
            hospitalName: formData.hospitalName || null,
            yearsOfExperience: formData.yearsOfExperience || null,
            avatarUrl: avatarUrl || null,
          },
        },
      });

      if (data?.updateUserProfile) {
        dispatch(updateProfile(data.updateUserProfile));
        setSuccess(true);
        setErrors({});
        setSelectedAvatarFile(null); // Clear selected file after successful save
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleAvatarFileSelect = (file) => {
    setSelectedAvatarFile(file);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#333',
            fontSize: { xs: '1.25rem', md: '1.5rem' },
          }}
        >
          HỒ SƠ
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Cập nhật thông tin thành công!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Có lỗi xảy ra: {error.message}
        </Alert>
      )}

      <AvatarUpload
        currentAvatar={formData.avatarUrl}
        userName={formData.fullName}
        onFileSelect={handleAvatarFileSelect}
        previewFile={selectedAvatarFile}
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <FormField
          label="Họ và tên"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Nhập họ và tên"
          required
          error={!!errors.fullName}
          helperText={errors.fullName}
        />

        <FormField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled
        />

        <FormField
          label="Số điện thoại"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Nhập số điện thoại (VD: 0912345678)"
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
        />

        <FormField
          label="CCCD"
          name="cccd"
          value={formData.cccd}
          onChange={handleChange}
          placeholder="Nhập số CCCD (9 hoặc 12 số)"
          error={!!errors.cccd}
          helperText={errors.cccd}
        />

        <FormField
          label="Địa chỉ"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Nhập địa chỉ"
          multiline
          rows={2}
          error={!!errors.address}
          helperText={errors.address}
        />

        <FormField
          label="Mã bác sĩ"
          name="doctorCode"
          value={formData.doctorCode}
          onChange={handleChange}
          placeholder="Nhập mã bác sĩ (VD: BS12345)"
          error={!!errors.doctorCode}
          helperText={errors.doctorCode}
        />

        <FormField
          label="Bệnh viện"
          name="hospitalName"
          value={formData.hospitalName}
          onChange={handleChange}
          placeholder="Nhập tên bệnh viện"
          error={!!errors.hospitalName}
          helperText={errors.hospitalName}
        />

        <FormField
          label="Số năm kinh nghiệm"
          name="yearsOfExperience"
          value={formData.yearsOfExperience}
          onChange={handleChange}
          placeholder="Nhập số năm kinh nghiệm (0-99)"
          type="number"
          error={!!errors.yearsOfExperience}
          helperText={errors.yearsOfExperience}
        />
      </Grid>

      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || uploading || Object.keys(errors).some(key => errors[key])}
          fullWidth={false}
          startIcon={(loading || uploading) && <CircularProgress size={20} />}
          sx={{
            px: { xs: 3, md: 4 },
            borderRadius: 8,
            textTransform: 'none',
            fontSize: { xs: '0.9rem', md: '1rem' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {uploading ? 'Đang tải ảnh...' : loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileSettings;