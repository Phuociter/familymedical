import { useMemo } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
} from '@mui/icons-material';

/**
 * Calculate age from date of birth
 * @param {string} dateOfBirth - Date string in format YYYY-MM-DD
 * @returns {number} Age in years
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Format date to Vietnamese format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Chưa có';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Get status color and label
 * @param {'normal'|'monitoring'|'active'} status
 * @returns {{color: string, label: string}}
 */
const getStatusInfo = (status) => {
  const statusMap = {
    normal: { color: 'success', label: 'Bình thường' },
    monitoring: { color: 'warning', label: 'Theo dõi' },
    active: { color: 'error', label: 'Đang điều trị' },
  };
  return statusMap[status] || statusMap.normal;
};

/**
 * PatientHeader Component
 * Displays patient basic information (simplified)
 * 
 * Requirements: 4.1
 * 
 * @component
 * @param {Object} props
 * @param {import('../../../types/doctorTypes').PatientDetail} props.patient - Patient detail object
 */
export default function PatientHeader({ patient }) {

  const age = useMemo(() => calculateAge(patient.dateOfBirth), [patient.dateOfBirth]);
  const statusInfo = useMemo(() => getStatusInfo(patient.currentStatus), [patient.currentStatus]);

  return (
    <Box>
      {/* Patient Photo - Centered */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Avatar
          src={patient.photoURL}
          alt={patient.fullName}
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'primary.main',
            fontSize: '2.5rem',
          }}
        >
          {patient.photoURL ? null : <PersonIcon fontSize="large" />}
        </Avatar>
      </Box>

      {/* Name and Status - Centered */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 1,
          }}
        >
          {patient.fullName}
        </Typography>
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      </Box>

      {/* Basic Info - Vertical Stack */}
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Tuổi:
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {age} tuổi
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Giới tính:
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {patient.gender}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Quan hệ:
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {patient.relationship}
          </Typography>
        </Box>
      </Stack>

      {/* Divider */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: 2 }} />

      {/* Quick Stats - Vertical */}
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Tổng số lần khám
          </Typography>
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            {patient.totalVisits || 0}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Lần khám gần nhất
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {formatDate(patient.lastVisitDate)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Trạng thái
          </Typography>
          <Typography
            variant="body2"
            color={`${statusInfo.color}.main`}
            fontWeight={600}
          >
            {statusInfo.label}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
