import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const getStatusConfig = (status) => {
  switch (status) {
    case 'active':
      return { label: 'Đang điều trị', color: 'success' };
    case 'monitoring':
      return { label: 'Theo dõi định kỳ', color: 'warning' };
    default:
      return { label: 'Bình thường', color: 'default' };
  }
};

const FamilyCard = ({ family, onSelect }) => {
  const statusConfig = family.status ? getStatusConfig(family.status) : null;

  return (
    <Card
      variant="outlined"
      onClick={() => onSelect(family)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5 } }}>
        <Grid container direction="column" spacing={2} sx={{ height: '100%' }}>
          {/* Header Section */}
          <Grid item>
            <Grid container spacing={1} alignItems="flex-start">
              <Grid item xs>
                <Typography variant="h6" component="h3" gutterBottom noWrap>
                  {family.familyName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'start', color: 'text.secondary' }}>
                  <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, mt: 0.2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    {family.familyAddress}
                  </Typography>
                </Box>
              </Grid>
              
              {statusConfig && (
                <Grid item>
                  <Chip
                    icon={<GroupIcon />}
                    label={`${family.members?.length || 0} thành viên`}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Info Section */}
          <Grid item sx={{ flexGrow: 1 }}>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    Chủ hộ:{' '}
                    <Typography component="span" variant="body2" fontWeight="medium" color="text.primary">
                      {family.headOfFamily.fullName}
                    </Typography>
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">{family.headOfFamily.phoneNumber}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {family.lastVisit && (
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">
                        Khám: {new Date(family.lastVisit).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Stack>
          </Grid>

          {/* Actions Section */}
          <Grid item>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(family);
                  }}
                >
                  Xem chi tiết
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={(e) => e.stopPropagation()}
                >
                  Lịch hẹn
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FamilyCard;
