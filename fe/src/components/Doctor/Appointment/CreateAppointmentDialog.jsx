import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { CREATE_APPOINTMENT } from '../../../graphql/doctorMutations';
import { GET_ASSIGNED_FAMILIES } from '../../../graphql/doctorQueries';

// Appointment types mapping to GraphQL enum
const APPOINTMENT_TYPES = [
  { value: 'GENERAL_CHECKUP', label: 'Khám tổng quát' },
  { value: 'FOLLOW_UP', label: 'Tái khám' },
  { value: 'CONSULTATION', label: 'Tư vấn' },
  { value: 'VACCINATION', label: 'Tiêm chủng' },
  { value: 'HOME_VISIT', label: 'Khám tại nhà' },
  { value: 'OTHER', label: 'Khác' },
];

export default function CreateAppointmentDialog({ open, onClose, onAppointmentCreated, conversation }) {
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
    doctorNotes: '',
  });

  // Fetch assigned families and their members
  const { data: familiesData, loading: familiesLoading } = useQuery(GET_ASSIGNED_FAMILIES, {
    skip: !open,
  });

  // Create appointment mutation
  const [createAppointment, { loading: creating, error: createError }] = useMutation(
    CREATE_APPOINTMENT,
    {
      onCompleted: (data) => {
        console.log('Appointment created:', data.createAppointment);
        if (onAppointmentCreated) {
          onAppointmentCreated(data.createAppointment);
        }
        handleClose();
      },
      onError: (error) => {
        console.error('Error creating appointment:', error);
      },
    }
  );

  // Flatten all members from all families
  // If conversation is provided, filter to only show members from that family
  const allPatients = useMemo(() => {
    if (!familiesData?.getDoctorAssignedFamilies) return [];
    
    let families = familiesData.getDoctorAssignedFamilies;
    
    // Filter by conversation family if provided
    if (conversation?.family?.familyID) {
      families = families.filter(
        family => family.familyID === conversation.family.familyID
      );
    }
    
    return families.flatMap(family => 
      family.members.map(member => ({
        memberID: member.memberID,
        familyID: family.familyID,
        name: member.fullName,
        familyName: family.familyName,
        // Calculate age if dateOfBirth is available
        age: member.dateOfBirth ? 
          new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear() : null,
        gender: member.gender || 'Không rõ',
      }))
    );
  }, [familiesData, conversation]);

  const handleSubmit = async () => {
    if (!formData.patient || !formData.title || !formData.type) {
      return;
    }

    try {
      // Convert datetime-local format to ISO DateTime
      const appointmentDateTime = new Date(formData.appointmentDateTime).toISOString();

      await createAppointment({
        variables: {
          input: {
            familyID: parseInt(formData.patient.familyID),
            memberID: parseInt(formData.patient.memberID),
            title: formData.title,
            type: formData.type,
            appointmentDateTime: appointmentDateTime,
            duration: parseInt(formData.duration),
            location: formData.location || null,
            notes: formData.notes || null,
            doctorNotes: formData.doctorNotes || null,
          },
        },
      });
    } catch (err) {
      console.error('Failed to create appointment:', err);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      patient: null,
      title: '',
      type: '',
      appointmentDateTime: getDefaultDateTime(),
      duration: 30,
      location: '',
      notes: '',
      doctorNotes: '',
    });
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Tạo lịch hẹn mới
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {createError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Không thể tạo lịch hẹn: {createError.message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Patient Selection */}
          <Autocomplete
            options={allPatients}
            value={formData.patient}
            onChange={(e, value) => handleChange('patient', value)}
            getOptionLabel={(option) => option.name}
            loading={familiesLoading}
            disabled={familiesLoading || creating}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn bệnh nhân"
                required
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {familiesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                >
                  {option.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.age ? `${option.age} tuổi • ` : ''}{option.gender} • {option.familyName}
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
            disabled={creating}
          >
            {APPOINTMENT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
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
            disabled={creating}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          {/* Duration */}
          <TextField
            select
            label="Thời gian (phút)"
            value={formData.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            fullWidth
            disabled={creating}
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
            disabled={creating}
            placeholder="Phòng khám 101"
          />

          {/* Patient Notes */}
          <TextField
            label="Ghi chú cho bệnh nhân"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            multiline
            rows={2}
            fullWidth
            disabled={creating}
            placeholder="Thông tin bệnh nhân có thể xem..."
          />

          {/* Doctor Notes */}
          <TextField
            label="Ghi chú cho bác sĩ"
            value={formData.doctorNotes}
            onChange={(e) => handleChange('doctorNotes', e.target.value)}
            multiline
            rows={2}
            fullWidth
            disabled={creating}
            placeholder="Ghi chú riêng của bác sĩ (bệnh nhân không thấy)..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={creating}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.patient || !formData.title || !formData.type || creating}
          startIcon={creating ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {creating ? 'Đang tạo...' : 'Tạo lịch hẹn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
