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
  
  // Calculate total visits from medical records
  const totalVisits = patient.medicalRecords?.length || 0;
  
  // Get last visit date from medical records
  const lastVisitDate = useMemo(() => {
    if (!patient.medicalRecords || patient.medicalRecords.length === 0) return null;
    const sortedRecords = [...patient.medicalRecords].sort(
      (a, b) => new Date(b.recordDate) - new Date(a.recordDate)
    );
    return sortedRecords[0]?.recordDate;
  }, [patient.medicalRecords]);

  return (
    <Box>
      {/* Patient Photo - Centered - Responsive */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1.5, sm: 2 } }}>
        <Avatar
          alt={patient.fullName}
          sx={{
            width: { xs: 80, sm: 90, md: 100 },
            height: { xs: 80, sm: 90, md: 100 },
            bgcolor: 'primary.main',
            fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem' },
          }}
        >
          <PersonIcon fontSize="large" />
        </Avatar>
      </Box>

      {/* Name - Centered - Responsive */}
      <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
          }}
        >
          {patient.fullName}
        </Typography>
      </Box>

      {/* Basic Info - Vertical Stack - Responsive */}
      <Stack spacing={{ xs: 1.25, sm: 1.5 }} sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            Tuổi:
          </Typography>
          <Typography 
            variant="body2" 
            color="text.primary" 
            fontWeight={500}
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            {age} tuổi
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            Giới tính:
          </Typography>
          <Typography 
            variant="body2" 
            color="text.primary" 
            fontWeight={500}
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            {patient.gender}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            Quan hệ:
          </Typography>
          <Typography 
            variant="body2" 
            color="text.primary" 
            fontWeight={500}
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            {patient.relationship}
          </Typography>
        </Box>
      </Stack>

      {/* Divider */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: { xs: 1.5, sm: 2 } }} />

      {/* Quick Stats - Vertical - Responsive */}
      <Stack spacing={{ xs: 1.5, sm: 2 }}>
        <Box>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            gutterBottom
            sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
          >
            Tổng số hồ sơ
          </Typography>
          <Typography 
            variant="h6" 
            color="primary.main" 
            fontWeight={600}
            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
          >
            {totalVisits}
          </Typography>
        </Box>
        <Box>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            gutterBottom
            sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
          >
            Lần khám gần nhất
          </Typography>
          <Typography 
            variant="body2" 
            color="text.primary" 
            fontWeight={500}
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            {formatDate(lastVisitDate)}
          </Typography>
        </Box>
        {patient.cccd && (
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              display="block" 
              gutterBottom
              sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
            >
              CCCD
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={500}
              sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
            >
              {patient.cccd}
            </Typography>
          </Box>
        )}
        {patient.phoneNumber && (
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              display="block" 
              gutterBottom
              sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
            >
              Số điện thoại
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={500}
              sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
            >
              {patient.phoneNumber}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
