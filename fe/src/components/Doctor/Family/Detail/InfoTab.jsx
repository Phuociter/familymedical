import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as DoctorIcon,
  Badge as BadgeIcon,
  Description as NotesIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Cake as BirthdayIcon,
  EventAvailable as LastVisitIcon,
  Assignment as VisitCountIcon,
  HealthAndSafety as StatusIcon,
  Groups as FamilyIcon,
} from '@mui/icons-material';

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Icon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.3 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
    </Box>
  );
};

const getStatusColor = (status) => {
  const statusColors = {
    active: 'error',
    monitoring: 'warning',
    normal: 'success',
  };
  return statusColors[status] || 'default';
};

const getStatusLabel = (status) => {
  const statusLabels = {
    active: 'Đang điều trị',
    monitoring: 'Theo dõi',
    normal: 'Bình thường',
  };
  return statusLabels[status] || status;
};

function InfoTab({ family }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(family?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!family) {
    return (
      <Box sx={{ px: 2, textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Không có thông tin gia đình
        </Typography>
      </Box>
    );
  }

  const { headOfFamily } = family;

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handleCancelEdit = () => {
    setNotes(family.notes || '');
    setIsEditingNotes(false);
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    // TODO: Implement API call to save notes
    // await updateFamilyNotes(family.familyID, notes);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditingNotes(false);
      // Show success message
      console.log('Notes saved:', notes);
    }, 500);
  };

  return (
    <Box sx={{ px: 2 }}>
      <Grid container spacing={3}>
        {/* Family Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                Thông tin Gia đình
              </Typography>

              <InfoRow icon={FamilyIcon} label="Tên gia đình" value={family.familyName} />
              <InfoRow icon={LocationIcon} label="Địa chỉ" value={family.familyAddress} />
              <InfoRow
                icon={CalendarIcon}
                label="Ngày đăng ký"
                value={
                  family.registrationDate
                    ? new Date(family.registrationDate).toLocaleDateString('vi-VN')
                    : null
                }
              />
              {/* <InfoRow icon={DoctorIcon} label="Bác sĩ phụ trách" value={family.assignedDoctor} /> */}
              <InfoRow
                icon={LastVisitIcon}
                label="Lần khám gần nhất"
                value={
                  family.lastVisit ? new Date(family.lastVisit).toLocaleDateString('vi-VN') : null
                }
              />
              <InfoRow icon={VisitCountIcon} label="Tổng số lần khám" value={family.visitCount} />

              {/* {family.status && (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <StatusIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.3 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Tình trạng
                    </Typography>
                    <Chip
                      label={getStatusLabel(family.status)}
                      color={getStatusColor(family.status)}
                      size="small"
                    />
                  </Box>
                </Box>
              )} */}
            </CardContent>
          </Card>
        </Grid>

        {/* Head of Family Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                Thông tin Chủ hộ
              </Typography>

              {headOfFamily ? (
                <>
                  <InfoRow icon={PersonIcon} label="Họ và tên" value={headOfFamily.fullName} />
                  <InfoRow icon={PhoneIcon} label="Số điện thoại" value={headOfFamily.phoneNumber} />
                  <InfoRow icon={EmailIcon} label="Email" value={headOfFamily.email} />
                  <InfoRow icon={BadgeIcon} label="CCCD" value={headOfFamily.cccd} />
                  <InfoRow
                    icon={BirthdayIcon}
                    label="Ngày sinh"
                    value={
                      headOfFamily.dateOfBirth
                        ? new Date(headOfFamily.dateOfBirth).toLocaleDateString('vi-VN')
                        : null
                    }
                  />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có thông tin chủ hộ
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notes Card */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotesIcon color="primary" />
                  Ghi chú
                </Typography>
                {!isEditingNotes && (
                  <IconButton
                    size="small"
                    onClick={handleEditNotes}
                    sx={{
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'primary.lighter' },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {isEditingNotes ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú về gia đình..."
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CloseIcon />}
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {family.notes || 'Chưa có ghi chú'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

InfoTab.propTypes = {
  family: PropTypes.shape({
    familyID: PropTypes.string.isRequired,
    familyName: PropTypes.string.isRequired,
    familyAddress: PropTypes.string,
    status: PropTypes.string,
    lastVisit: PropTypes.string,
    registrationDate: PropTypes.string,
    assignedDoctor: PropTypes.string,
    visitCount: PropTypes.number,
    notes: PropTypes.string,
    headOfFamily: PropTypes.shape({
      memberID: PropTypes.string,
      fullName: PropTypes.string,
      phoneNumber: PropTypes.string,
      email: PropTypes.string,
      cccd: PropTypes.string,
      dateOfBirth: PropTypes.string,
    }),
  }).isRequired,
};

InfoRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default InfoTab;
