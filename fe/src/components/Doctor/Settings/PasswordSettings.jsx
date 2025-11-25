import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { CHANGE_PASSWORD } from '../../../graphql/doctorMutations';

export default function PasswordSettings({ userId }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [changePassword, { loading, error }] = useMutation(CHANGE_PASSWORD);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
  };

  const toggleShowPassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setValidationError('');

    // Validation
    if (formData.newPassword.length < 6) {
      setValidationError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await changePassword({
        variables: {
          userID: userId,
          input: {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          },
        },
      });

      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
    }
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
          ĐỔI MẬT KHẨU
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Đổi mật khẩu thành công!
        </Alert>
      )}
      {(error || validationError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {validationError || error?.message}
        </Alert>
      )}

      <Box sx={{ maxWidth: { xs: '100%', md: 600 } }}>
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Mật khẩu cũ<span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập mật khẩu hiện tại"
            name="currentPassword"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Mật khẩu mới<span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập mật khẩu mới"
            name="newPassword"
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Xác nhận mật khẩu mới<span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập lại mật khẩu mới"
            name="confirmPassword"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('confirm')}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
          sx={{
            px: { xs: 3, md: 4 },
            py: { xs: 1.2, md: 1.5 },
            borderRadius: 8,
            textTransform: 'none',
            fontSize: { xs: '0.9rem', md: '1rem' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </Box>
    </Box>
  );
}
