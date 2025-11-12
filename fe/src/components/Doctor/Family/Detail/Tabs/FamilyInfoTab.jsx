import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { UPDATE_FAMILY_INFO } from '../../../../../graphql/doctorMutations';
/**
 * InfoRow component - Display a labeled information row with icon
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.label - Label text
 * @param {string} props.value - Value text
 */
function InfoRow({ icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ color: 'primary.main', mr: 2, display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1">{value || 'Chưa có thông tin'}</Typography>
      </Box>
    </Box>
  );
}

/**
 * FamilyInfoTab component - Display household head and family contact information
 * @param {Object} props
 * @param {import('../../../../../types/doctorTypes').FamilyDetail} props.family - Family detail object
 */
export default function FamilyInfoTab({ family }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(family?.notes || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [updateFamilyInfo, { loading }] = useMutation(UPDATE_FAMILY_INFO, {
    onCompleted: () => {
      setShowSuccess(true);
      setIsEditingNotes(false);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Có lỗi xảy ra khi lưu ghi chú');
      setShowError(true);
    },
  });

  const handleSaveNotes = async () => {
    try {
      await updateFamilyInfo({
        variables: {
          familyId: family.familyID,
          input: {
            notes,
          },
        },
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleCancelEdit = () => {
    setNotes(family?.notes || '');
    setIsEditingNotes(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!family) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="warning">Không tìm thấy thông tin gia đình</Alert>
      </Box>
    );
  }

  const { headOfFamily } = family;

  return (
    <Box sx={{ py: 3 }}>
      {/* Household Head Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 1 }} />
          Thông tin chủ hộ
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoRow
              icon={<PersonIcon />}
              label="Họ và tên"
              value={headOfFamily?.fullName}
            />
            <InfoRow
              icon={<PhoneIcon />}
              label="Số điện thoại"
              value={headOfFamily?.phoneNumber}
            />
            <InfoRow
              icon={<EmailIcon />}
              label="Email"
              value={headOfFamily?.email}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow
              icon={<PersonIcon />}
              label="Số CCCD"
              value={headOfFamily?.cccd}
            />
            <InfoRow
              icon={<CalendarIcon />}
              label="Ngày sinh"
              value={formatDate(headOfFamily?.dateOfBirth)}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Family Contact Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HomeIcon sx={{ mr: 1 }} />
          Thông tin liên hệ gia đình
        </Typography>
        <InfoRow
          icon={<HomeIcon />}
          label="Địa chỉ"
          value={family.familyAddress}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Clinic Relationship History */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HospitalIcon sx={{ mr: 1 }} />
          Lịch sử quan hệ với phòng khám
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <InfoRow
              icon={<CalendarIcon />}
              label="Ngày đăng ký"
              value={formatDate(family.registrationDate)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoRow
              icon={<PersonIcon />}
              label="Bác sĩ phụ trách"
              value={family.assignedDoctor}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoRow
              icon={<HospitalIcon />}
              label="Số lần khám"
              value={family.visitCount?.toString() || '0'}
            />
          </Grid>
          <Grid item xs={12}>
            <InfoRow
              icon={<CalendarIcon />}
              label="Lần khám gần nhất"
              value={formatDate(family.lastVisit)}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Family Notes Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            Ghi chú về gia đình
          </Typography>
          {!isEditingNotes && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditingNotes(true)}
            >
              Chỉnh sửa
            </Button>
          )}
        </Box>
        {isEditingNotes ? (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú về gia đình..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotes}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="body1"
            color={notes ? 'text.primary' : 'text.secondary'}
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {notes || 'Chưa có ghi chú nào'}
          </Typography>
        )}
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Lưu ghi chú thành công!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
