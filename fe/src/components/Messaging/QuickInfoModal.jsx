import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Stack,
  Divider,
  Chip,
  Paper,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Favorite as FavoriteIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { GET_FAMILY_DETAIL, GET_PATIENT_DETAIL } from '../../graphql/doctorQueries';
import MedicalRecordTimeline from '../Doctor/Patient/MedicalRecordTimeline/MedicalRecordTimeline';

const RELATIONSHIP_LABELS = {
  'Chủ hộ': 'Bản thân',
  'Vợ': 'Vợ/Chồng',
  'Chồng': 'Vợ/Chồng',
  'Con': 'Con',
  'Cha': 'Cha',
  'Mẹ': 'Mẹ',
  'Anh': 'Anh/Chị/Em',
  'Chị': 'Anh/Chị/Em',
  'Em': 'Anh/Chị/Em',
};

/**
 * Calculate age from date of birth
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
 * QuickInfoModal - Modal xem thông tin gia đình và thành viên
 * Layout 2 cột: sidebar bên trái (danh sách thành viên) và panel bên phải (thông tin chi tiết)
 */
export default function QuickInfoModal({ 
  open, 
  onClose, 
  conversation, 
  currentUserRole 
}) {
  const [selectedMemberID, setSelectedMemberID] = useState(null);
  const familyID = conversation?.family?.familyID;

  // Query family detail with members
  const { data: familyData, loading: familyLoading } = useQuery(
    GET_FAMILY_DETAIL,
    {
      skip: !open || currentUserRole !== 'DOCTOR' || !familyID,
      variables: { familyId: familyID ? parseInt(familyID) : null },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Query selected member detail
  const { data: memberData, loading: memberLoading, error: memberError } = useQuery(
    GET_PATIENT_DETAIL,
    {
      skip: !open || !selectedMemberID || currentUserRole !== 'DOCTOR',
      variables: { memberId: selectedMemberID ? parseInt(selectedMemberID) : null },
      fetchPolicy: 'cache-and-network',
    }
  );

  const family = familyData?.familyDetail;
  const members = family?.members || [];
  const selectedMember = memberData?.memberDetail;

  // Calculate age and lastVisitDate for selected member (at component level to avoid hooks violation)
  const selectedMemberAge = useMemo(() => {
    if (!selectedMember?.dateOfBirth) return 0;
    return calculateAge(selectedMember.dateOfBirth);
  }, [selectedMember?.dateOfBirth]);

  const lastVisitDate = useMemo(() => {
    if (!selectedMember?.medicalRecords || selectedMember.medicalRecords.length === 0) return null;
    const sortedRecords = [...selectedMember.medicalRecords].sort(
      (a, b) => new Date(b.recordDate) - new Date(a.recordDate)
    );
    return sortedRecords[0]?.recordDate;
  }, [selectedMember?.medicalRecords]);

  const totalVisits = selectedMember?.medicalRecords?.length || 0;

  // Auto-select first member when family data loads
  useEffect(() => {
    if (members.length > 0 && !selectedMemberID) {
      setSelectedMemberID(members[0].memberID);
    }
  }, [members, selectedMemberID]);

  // Get medical records count for a member
  const getMedicalRecordsCount = (memberID) => {
    if (selectedMember && selectedMember.memberID === memberID) {
      return selectedMember.medicalRecords?.length || 0;
    }
    return 0;
  };

  const handleClose = () => {
    setSelectedMemberID(null);
    onClose();
  };

  // Render left sidebar with member list
  const renderSidebar = () => (
    <Box
      sx={{
        width: 320,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.50',
      }}
    >
      {/* Members list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1.5, color: 'text.secondary', fontWeight: 600 }}>
          Danh sách thành viên
        </Typography>
        {familyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : members.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Chưa có thành viên nào
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {members.map((member) => {
              const age = calculateAge(member.dateOfBirth);
              const relationshipLabel = RELATIONSHIP_LABELS[member.relationship] || member.relationship;
              const isSelected = selectedMemberID === member.memberID;
              const recordsCount = getMedicalRecordsCount(member.memberID);

              return (
                <ListItem key={member.memberID} disablePadding>
                  <ListItemButton
                    onClick={() => setSelectedMemberID(member.memberID)}
                    selected={isSelected}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderLeft: isSelected ? 3 : 0,
                      borderColor: isSelected ? 'primary.main' : 'transparent',
                      bgcolor: isSelected ? 'primary.50' : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.50' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        {member.fullName?.charAt(0) || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.fullName}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      secondary={
                        <>
                          {relationshipLabel} {age ? `- ${age} tuổi` : ''}
                          {recordsCount > 0 && (
                            <>
                              {' • '}
                              {recordsCount} hồ sơ
                            </>
                          )}
                        </>
                      }
                      secondaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                    <ArrowForwardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );

  // Render PatientHeader-like component
  const renderPatientHeader = () => {
    if (!selectedMember) return null;

    return (
      <Box>
        {/* Patient Photo - Centered */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar
            alt={selectedMember.fullName}
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              fontSize: '2.5rem',
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>
        </Box>

        {/* Name - Centered */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.25rem',
            }}
          >
            {selectedMember.fullName}
          </Typography>
        </Box>

        {/* Basic Info - Vertical Stack */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Tuổi:
            </Typography>
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              {selectedMemberAge} tuổi
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Giới tính:
            </Typography>
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              {selectedMember.gender || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Quan hệ:
            </Typography>
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              {selectedMember.relationship || 'N/A'}
            </Typography>
          </Box>
        </Stack>

        {/* Divider */}
        <Divider sx={{ my: 2 }} />

        {/* Quick Stats - Vertical */}
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Tổng số hồ sơ
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              {totalVisits}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Lần khám gần nhất
            </Typography>
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              {formatDate(lastVisitDate)}
            </Typography>
          </Box>
          {selectedMember.cccd && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                CCCD
              </Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                {selectedMember.cccd}
              </Typography>
            </Box>
          )}
          {selectedMember.phoneNumber && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Số điện thoại
              </Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                {selectedMember.phoneNumber}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    );
  };

  // Render right panel with member details
  const renderMemberDetails = () => {
    if (!selectedMemberID) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          <Typography color="textSecondary">
            Chọn một thành viên để xem thông tin chi tiết
          </Typography>
        </Box>
      );
    }

    if (memberLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (memberError) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          <Alert severity="error">Không thể tải thông tin thành viên: {memberError.message}</Alert>
        </Box>
      );
    }

    if (!selectedMember) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          <Alert severity="error">Không tìm thấy thông tin thành viên</Alert>
        </Box>
      );
    }

    const medicalRecords = selectedMember.medicalRecords || [];
    const relationshipLabel = RELATIONSHIP_LABELS[selectedMember.relationship] || selectedMember.relationship;
    const recentRecords = [...medicalRecords]
      .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate))
      .slice(0, 5);

    return (
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'grey.50' }}>
        {/* 1. Personal Information Section (White background) */}
        <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
              }}
            >
              {selectedMember.fullName?.charAt(0) || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {selectedMember.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {relationshipLabel} • {selectedMember.gender || 'N/A'} • {selectedMemberAge} tuổi
              </Typography>
            </Box>
          </Box>
          <Stack spacing={1.5}>
            {selectedMember.phoneNumber && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="error" />
                <Typography variant="body2">{selectedMember.phoneNumber}</Typography>
              </Box>
            )}
            {family?.headOfFamily?.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" sx={{ color: 'purple' }} />
                <Typography variant="body2">{family.headOfFamily.email}</Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* 4. Recent Medical Records Section (Light purple background) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt:2 }}>
            <DescriptionIcon fontSize="small" sx={{ color: 'purple' }} />
            <Typography variant="h6" fontWeight={600}>
            Hồ sơ y tế gần đây
            </Typography>
        </Box>
        {recentRecords.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Chưa có hồ sơ y tế nào
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {recentRecords.map((record) => {
                // Extract file name from fileLink if available, otherwise use fileType
                const fileName = record.fileLink 
                  ? record.fileLink.split('/').pop() || record.fileType || 'Hồ sơ y tế'
                  : record.fileType || 'Hồ sơ y tế';
                
                return (
                  <Paper
                    key={record.recordID}
                    sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Left side: Icon, File name, Metadata */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                      <DescriptionIcon sx={{ color: 'text.secondary', fontSize: 32 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 0.5,
                          }}
                        >
                          {fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.fileType || 'Hồ sơ y tế'} • {format(new Date(record.recordDate), 'dd/MM/yyyy', { locale: vi })}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right side: Action buttons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        sx={{ textTransform: 'none', color: 'text.primary' }}
                        onClick={() => {
                          if (record.fileLink) {
                            window.open(record.fileLink, '_blank');
                          }
                        }}
                        disabled={!record.fileLink}
                      >
                        Xem
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        sx={{ textTransform: 'none', color: 'text.primary' }}
                        onClick={() => {
                          if (record.fileLink) {
                            const link = document.createElement('a');
                            link.href = record.fileLink;
                            link.download = fileName;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        disabled={!record.fileLink}
                      >
                        Tải
                      </Button>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
      </Box>
    );
  };

  if (currentUserRole !== 'DOCTOR') {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Thông tin nhanh
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Chức năng này chỉ dành cho bác sĩ
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: 800,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Thông tin Gia đình Bệnh nhân
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, display: 'flex', height: 'calc(100% - 64px)', bgcolor: 'grey.50' }}>
        {renderSidebar()}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderMemberDetails()}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
