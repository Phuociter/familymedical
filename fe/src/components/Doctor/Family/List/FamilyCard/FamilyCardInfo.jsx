import { Box, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const FamilyCardInfo = ({ family }) => {
  return (
    <>
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
          <Grid item>
            <Chip
              icon={<GroupIcon />}
              label={`${family.members?.length || 0} thành viên`}
              size="small"
              variant="outlined"
            />
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
    </>
  );
};

export default FamilyCardInfo;
