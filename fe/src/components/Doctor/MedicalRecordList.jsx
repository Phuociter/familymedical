import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  LocalHospital as HospitalIcon,
  AttachFile as AttachFileIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

export default function MedicalRecordList({ member, records, loading, onBack }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Box>
      {onBack && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách thành viên
        </Button>
      )}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Hồ sơ bệnh án: {member.fullName}
        </Typography>
        <Typography color="textSecondary">
          Tổng số: {records.length} hồ sơ
        </Typography>
      </Box>

      {records.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="textSecondary">Chưa có hồ sơ bệnh án nào</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {records.map((record) => (
            <Grid item xs={12} key={record.recordID}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Hồ sơ #{record.recordID}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                        <CalendarIcon sx={{ fontSize: 18, mr: 1 }} />
                        <Typography variant="body2">
                          Ngày khám: {formatDate(record.recordDate)}
                        </Typography>
                      </Box>
                    </Box>
                    {record.fileLink && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AttachFileIcon />}
                        href={record.fileLink}
                        target="_blank"
                      >
                        Xem file
                      </Button>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <DescriptionIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Triệu chứng
                          </Typography>
                          <Typography variant="body2">
                            {record.symptoms || 'Không có thông tin'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <HospitalIcon sx={{ color: 'error.main', mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Chẩn đoán
                          </Typography>
                          <Typography variant="body2">
                            {record.diagnosis || 'Không có thông tin'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <DescriptionIcon sx={{ color: 'success.main', mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Phương án điều trị
                          </Typography>
                          <Typography variant="body2">
                            {record.treatmentPlan || 'Không có thông tin'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
