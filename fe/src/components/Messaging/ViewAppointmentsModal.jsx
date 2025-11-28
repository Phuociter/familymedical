import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  Button,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { GET_APPOINTMENTS } from '../../graphql/doctorQueries';
import { familyAppointments } from '../../graphql/familyQueries';
import CreateAppointmentDialog from '../Doctor/Appointment/CreateAppointmentDialog';

const APPOINTMENT_TYPE_LABELS = {
  GENERAL_CHECKUP: 'Khám tổng quát',
  FOLLOW_UP: 'Tái khám',
  CONSULTATION: 'Tư vấn',
  VACCINATION: 'Tiêm chủng',
  HOME_VISIT: 'Khám tại nhà',
  OTHER: 'Khác',
};

const APPOINTMENT_STATUS_LABELS = {
  SCHEDULED: 'Đã lên lịch',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS = {
  SCHEDULED: 'default',
  CONFIRMED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

/**
 * ViewAppointmentsModal - Modal xem danh sách lịch hẹn
 */
export default function ViewAppointmentsModal({ 
  open, 
  onClose, 
  conversation, 
  currentUserRole 
}) {
  const [createAppointmentOpen, setCreateAppointmentOpen] = useState(false);
  const familyID = conversation?.family?.familyID;

  // Query appointments for doctor
  const { data: appointmentsData, loading: appointmentsLoading, error: appointmentsError } = useQuery(
    GET_APPOINTMENTS,
    {
      skip: !open || currentUserRole !== 'DOCTOR' || !familyID,
      variables: {
        filter: {
          familyID: familyID ? parseInt(familyID) : null,
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Query family appointments for family
  const { data: familyAppointmentsData, loading: familyAppointmentsLoading, error: familyAppointmentsError } = useQuery(
    familyAppointments,
    {
      skip: !open || currentUserRole !== 'FAMILY',
      fetchPolicy: 'cache-and-network',
    }
  );

  const loading = currentUserRole === 'DOCTOR' ? appointmentsLoading : familyAppointmentsLoading;
  const error = currentUserRole === 'DOCTOR' ? appointmentsError : familyAppointmentsError;
  const appointments = currentUserRole === 'DOCTOR' 
    ? appointmentsData?.appointments || []
    : familyAppointmentsData?.familyAppointments || [];

  // Filter appointments by familyID for family users
  let filteredAppointments = appointments;
  if (currentUserRole === 'FAMILY' && familyID) {
    // For family users, filter to show only appointments for this family
    // Note: familyAppointments query should already filter by current user's family
    // But we can add additional filtering here if needed
    filteredAppointments = appointments.filter(apt => 
      apt.family?.familyID === parseInt(familyID)
    );
  }

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime)
  );

  const handleCreateAppointment = () => {
    setCreateAppointmentOpen(true);
  };

  const handleAppointmentCreated = () => {
    setCreateAppointmentOpen(false);
    // Refetch appointments data will be handled by Apollo cache
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Lịch hẹn
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Lịch hẹn
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Không thể tải danh sách lịch hẹn: {error.message}
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Lịch hẹn ({sortedAppointments.length})
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentUserRole === 'DOCTOR' && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateAppointment}
                  sx={{ textTransform: 'none' }}
                >
                  Thêm nhanh lịch hẹn
                </Button>
              )}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={(theme) => ({
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: theme.palette.grey[500],
                })}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
        {sortedAppointments.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">Chưa có lịch hẹn nào</Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
            {sortedAppointments.map((appointment, index) => (
              <Box key={appointment.appointmentID}>
                <Box
                  sx={{
                    p: 2.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {appointment.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        <Chip
                          label={APPOINTMENT_STATUS_LABELS[appointment.status] || appointment.status}
                          size="small"
                          color={STATUS_COLORS[appointment.status] || 'default'}
                        />
                        {appointment.type && (
                          <Chip
                            label={APPOINTMENT_TYPE_LABELS[appointment.type] || appointment.type}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Thời gian:</strong> {format(new Date(appointment.appointmentDateTime), "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Thời lượng:</strong> {appointment.duration} phút
                    </Typography>
                    {appointment.location && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Địa điểm:</strong> {appointment.location}
                      </Typography>
                    )}
                    {currentUserRole === 'DOCTOR' && appointment.member && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Bệnh nhân:</strong> {appointment.member.fullName}
                      </Typography>
                    )}
                    {currentUserRole === 'FAMILY' && appointment.doctor && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Bác sĩ:</strong> {appointment.doctor.fullName}
                      </Typography>
                    )}
                    {appointment.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Ghi chú:</strong> {appointment.notes}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {index < sortedAppointments.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}
        </DialogContent>
      </Dialog>

      {/* Create Appointment Dialog */}
      {currentUserRole === 'DOCTOR' && (
        <CreateAppointmentDialog
          open={createAppointmentOpen}
          onClose={() => setCreateAppointmentOpen(false)}
          onAppointmentCreated={handleAppointmentCreated}
          conversation={conversation}
        />
      )}
    </>
  );
}

