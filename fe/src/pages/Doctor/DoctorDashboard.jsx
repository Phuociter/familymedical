import { useQuery } from '@apollo/client/react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  AssignmentInd as AssignmentIndIcon,
} from '@mui/icons-material';
import { GET_ASSIGNED_FAMILIES } from '../../graphql/doctorQueries';
import { MOCK_REQUEST_STATS } from '../../mocks/doctorRequestsMockData';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600, color }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function DoctorDashboard() {
  const { data, loading } = useQuery(GET_ASSIGNED_FAMILIES, {
    fetchPolicy: 'cache-and-network',
  });

  const families = data?.doctorAssignedFamilies || [];
  const totalMembers = families.reduce((sum, family) => sum + (family.members?.length || 0), 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Yêu cầu chờ xử lý"
            value={MOCK_REQUEST_STATS.pending}
            icon={<AssignmentIndIcon sx={{ fontSize: 32, color: '#f57c00' }} />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng gia đình"
            value={families.length}
            icon={<PeopleIcon sx={{ fontSize: 32, color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng bệnh nhân"
            value={totalMembers}
            icon={<PersonIcon sx={{ fontSize: 32, color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lịch hẹn hôm nay"
            value="5"
            icon={<TrendingUpIcon sx={{ fontSize: 32, color: '#9c27b0' }} />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography color="textSecondary">
                Chức năng đang được phát triển...
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông báo
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography color="textSecondary">
                Không có thông báo mới
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
