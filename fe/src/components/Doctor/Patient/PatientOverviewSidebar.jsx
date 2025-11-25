import { Box, Card, Typography, Divider, Stack, Chip, Alert } from '@mui/material';
import {
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import HealthIndicatorCard from './HealthIndicatorCard';
import {
  MOCK_HEALTH_INDICATORS,
  MOCK_PRESCRIPTIONS,
  MOCK_APPOINTMENTS,
} from '../../../mocks/familyMockData';

/**
 * Format date and time for appointments
 * @param {string} dateString - ISO date string
 * @param {string} timeString - Time string (HH:mm)
 * @returns {string} Formatted date and time
 */
const formatAppointmentDateTime = (dateString, timeString) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${formattedDate} - ${timeString}`;
};

/**
 * Get critical health indicators (warning or critical status)
 * @param {import('../../../types/doctorTypes').HealthIndicator[]} indicators
 * @returns {import('../../../types/doctorTypes').HealthIndicator[]}
 */
const getCriticalIndicators = (indicators) => {
  if (!indicators || indicators.length === 0) return [];
  return indicators.filter(
    (indicator) => indicator.status === 'warning' || indicator.status === 'critical'
  );
};

/**
 * Get latest health indicators (most recent measurement for each type)
 * @param {import('../../../types/doctorTypes').HealthIndicator[]} indicators
 * @returns {import('../../../types/doctorTypes').HealthIndicator[]}
 */
const getLatestIndicators = (indicators) => {
  if (!indicators || indicators.length === 0) return [];
  
  // Group by indicator type and get the most recent
  const latestByType = {};
  indicators.forEach((indicator) => {
    const existing = latestByType[indicator.indicatorType];
    if (
      !existing ||
      new Date(indicator.measurementDate) > new Date(existing.measurementDate)
    ) {
      latestByType[indicator.indicatorType] = indicator;
    }
  });
  
  return Object.values(latestByType);
};

/**
 * Get active prescriptions
 * @param {import('../../../types/doctorTypes').Prescription[]} prescriptions
 * @returns {import('../../../types/doctorTypes').Prescription[]}
 */
const getActivePrescriptions = (prescriptions) => {
  if (!prescriptions || prescriptions.length === 0) return [];
  return prescriptions.filter((rx) => rx.status === 'active');
};

/**
 * Get upcoming appointments (future dates only)
 * @param {Array} appointments
 * @returns {Array}
 */
const getUpcomingAppointments = (appointments) => {
  if (!appointments || appointments.length === 0) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return appointments
    .filter((apt) => new Date(apt.appointmentDate) >= today)
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 3); // Show only next 3 appointments
};

/**
 * PatientOverviewSidebar Component
 * Displays key health information at a glance
 * 
 * Requirements: 4.3
 * 
 * @component
 * @param {Object} props
 * @param {import('../../../types/doctorTypes').PatientDetail} props.patient - Patient detail object
 */
export default function PatientOverviewSidebar({ patient }) {
  // Get mock data for this patient
  const allIndicators = MOCK_HEALTH_INDICATORS[patient.memberID] || [];
  const allPrescriptions = MOCK_PRESCRIPTIONS[patient.memberID] || [];
  const allAppointments = MOCK_APPOINTMENTS[patient.memberID] || [];

  // Process data
  const latestIndicators = getLatestIndicators(allIndicators);
  const criticalIndicators = getCriticalIndicators(allIndicators);
  const activePrescriptions = getActivePrescriptions(allPrescriptions);
  const upcomingAppointments = getUpcomingAppointments(allAppointments);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
      {/* Alerts and Warnings - Responsive */}
      {criticalIndicators.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />}
          sx={{
            '& .MuiAlert-message': {
              width: '100%',
            },
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
          }}
        >
          <Typography 
            variant="body2" 
            fontWeight={600} 
            gutterBottom
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            Cảnh báo sức khỏe
          </Typography>
          <Typography 
            variant="caption"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
          >
            Có {criticalIndicators.length} chỉ số cần chú ý
          </Typography>
        </Alert>
      )}

      {/* Health Indicators Section - Responsive */}
      <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          fontWeight={600}
          sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
        >
          Chỉ số sức khỏe
        </Typography>
        <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
        
        {latestIndicators.length > 0 ? (
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            {latestIndicators.map((indicator) => (
              <HealthIndicatorCard
                key={indicator.indicatorID}
                indicator={indicator}
                showTrend={false}
              />
            ))}
          </Stack>
        ) : (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            textAlign="center" 
            py={2}
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            Chưa có dữ liệu chỉ số sức khỏe
          </Typography>
        )}
      </Card>

      {/* Current Medications Section - Responsive */}
      <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1.5, sm: 2 } }}>
          <MedicationIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography 
            variant="h6" 
            fontWeight={600}
            sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
          >
            Thuốc đang dùng
          </Typography>
        </Box>
        <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
        
        {activePrescriptions.length > 0 ? (
          <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
            {activePrescriptions.map((prescription) => (
              <Box
                key={prescription.prescriptionID}
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  borderLeft: 3,
                  borderColor: 'primary.main',
                }}
              >
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                >
                  {prescription.medicationName}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  display="block"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
                >
                  {prescription.dosage} - {prescription.frequency}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  display="block"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
                >
                  Thời gian: {prescription.duration}
                </Typography>
                <Chip
                  label="Đang dùng"
                  size="small"
                  color="success"
                  sx={{ 
                    mt: 1, 
                    fontSize: { xs: '0.688rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                  }}
                />
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            textAlign="center" 
            py={2}
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            Không có thuốc đang sử dụng
          </Typography>
        )}
      </Card>

      {/* Upcoming Appointments Section - Responsive */}
      <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1.5, sm: 2 } }}>
          <CalendarIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography 
            variant="h6" 
            fontWeight={600}
            sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
          >
            Lịch hẹn sắp tới
          </Typography>
        </Box>
        <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
        
        {upcomingAppointments.length > 0 ? (
          <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
            {upcomingAppointments.map((appointment) => (
              <Box
                key={appointment.appointmentID}
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  borderLeft: 3,
                  borderColor: 'info.main',
                }}
              >
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                >
                  {appointment.reason}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  display="block"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
                >
                  {formatAppointmentDateTime(
                    appointment.appointmentDate,
                    appointment.appointmentTime
                  )}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  display="block"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
                >
                  Bác sĩ: {appointment.doctorName}
                </Typography>
                <Chip
                  label="Đã đặt"
                  size="small"
                  color="info"
                  sx={{ 
                    mt: 1, 
                    fontSize: { xs: '0.688rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                  }}
                />
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            textAlign="center" 
            py={2}
            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
          >
            Không có lịch hẹn sắp tới
          </Typography>
        )}
      </Card>

      {/* Contact Information - Responsive */}
      <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          fontWeight={600}
          sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
        >
          Thông tin liên hệ
        </Typography>
        <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
        
        <Stack spacing={{ xs: 1, sm: 1.25 }}>
          {patient.phoneNumber && (
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
              >
                Số điện thoại
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
              >
                {patient.phoneNumber}
              </Typography>
            </Box>
          )}
          
          {patient.email && (
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
              >
                Email
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
              >
                {patient.email}
              </Typography>
            </Box>
          )}
          
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
            >
              CCCD
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight={500}
              sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
            >
              {patient.cccd}
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
