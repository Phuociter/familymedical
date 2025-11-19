import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AssignmentInd as AssignmentIndIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { GET_ASSIGNED_FAMILIES } from '../../graphql/doctorQueries';
import { MOCK_REQUEST_STATS, getRequestsByStatus } from '../../mocks/doctorRequestsMockData';
import { getMockDashboardData } from '../../mocks/dashboardMockData';
import StatCardSkeleton from '../../components/Doctor/Dashboard/StatCardSkeleton';
import ChartSkeleton from '../../components/Doctor/Dashboard/ChartSkeleton';
import AppointmentListSkeleton from '../../components/Doctor/Dashboard/AppointmentListSkeleton';
import RequestListSkeleton from '../../components/Doctor/Dashboard/RequestListSkeleton';
import MedicalRecordListSkeleton from '../../components/Doctor/Dashboard/MedicalRecordListSkeleton';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TodayAppointmentItem = ({ appointment }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Avatar
        src={`https://i.pravatar.cc/150?u=${appointment.member.memberID}`}
        alt={appointment.member.fullName}
        sx={{ width: 40, height: 40, mr: 2 }}
      />
      <Box>
        <Typography variant="body1" fontWeight={600}>
          {appointment.member.fullName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {appointment.title}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ textAlign: 'right' }}>
      <Typography variant="body1" fontWeight={500} color="primary">
        {format(parseISO(appointment.appointmentDateTime), 'HH:mm')}
      </Typography>
      <Chip label={appointment.type} size="small" color="primary" variant="outlined" />
    </Box>
  </Box>
);

const PendingRequestItem = ({ request }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Box sx={{ flex: 1, mr: 2 }}>
      <Typography variant="body1" fontWeight={600}>
        {request.familyName}
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 300,
        }}
      >
        {request.message || 'Không có tin nhắn'}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton
        size="small"
        sx={{
          bgcolor: 'success.light',
          color: 'success.dark',
          '&:hover': { bgcolor: 'success.main', color: 'white' },
        }}
      >
        <CheckCircleIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        sx={{
          bgcolor: 'error.light',
          color: 'error.dark',
          '&:hover': { bgcolor: 'error.main', color: 'white' },
        }}
      >
        <CancelIcon fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

export default function DoctorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const { data, loading } = useQuery(GET_ASSIGNED_FAMILIES, {
    fetchPolicy: 'cache-and-network',
  });

  const families = data?.doctorAssignedFamilies || [];
  const totalMembers = families.reduce((sum, family) => sum + (family.members?.length || 0), 0);

  useEffect(() => {
    const mockData = getMockDashboardData();
    setDashboardData(mockData);
  }, []);

  if (loading || !dashboardData) {
    return (
      <Box container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Chào mừng trở lại! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Đây là tổng quan hoạt động của bạn hôm nay.
          </Typography>
        </Box>

        {/* Stats Cards Skeleton */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[...Array(4)].map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCardSkeleton />
            </Grid>
          ))}
        </Grid>

        {/* Chart and Appointments Skeleton */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <ChartSkeleton />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AppointmentListSkeleton />
          </Grid>
        </Grid>

        {/* Requests and Medical Records Skeleton */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <RequestListSkeleton />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MedicalRecordListSkeleton />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const pendingRequests = getRequestsByStatus('PENDING');
  const formattedWeeklyStats = dashboardData.weeklyStats.map(stat => ({
    ...stat,
    date: format(parseISO(stat.date), 'EEE', { locale: vi }),
  }));

  return (
    <Box container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Chào mừng trở lại! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Đây là tổng quan hoạt động của bạn hôm nay.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs:12, sm:6, lg:3 }}>
          <StatCard
            title="Lịch hẹn hôm nay"
            value={dashboardData.todayAppointmentsCount}
            icon={<CalendarIcon sx={{ fontSize: 28, color: '#3b82f6' }} />}
            color="#3b82f6"
          />
        </Grid>
        <Grid size={{ xs:12, sm:6, lg:3 }}>
          <StatCard
            title="Yêu cầu chờ xử lý"
            value={MOCK_REQUEST_STATS.pending}
            icon={<AssignmentIndIcon sx={{ fontSize: 28, color: '#f59e0b' }} />}
            color="#f59e0b"
          />
        </Grid>
        <Grid size={{ xs:12, sm:6, lg:3 }}>
          <StatCard
            title="Gia đình được gán"
            value={families.length}
            icon={<PeopleIcon sx={{ fontSize: 28, color: '#10b981' }} />}
            color="#10b981"
          />
        </Grid>
        <Grid size={{ xs:12, sm:6, lg:3 }}>
          <StatCard
            title="Tổng bệnh nhân"
            value={totalMembers}
            icon={<PersonIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Chart and Today's Appointments */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg:8}}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Hoạt động trong tuần
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedWeeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31, 41, 55, 0.95)',
                      borderColor: '#4b5563',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="appointmentsCount" name="Lịch hẹn" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="consultationsCount" name="Tư vấn" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs:12, lg:4 }}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Lịch hẹn hôm nay
            </Typography>
            <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {dashboardData.todayAppointments.length > 0 ? (
                dashboardData.todayAppointments.map(appt => (
                  <TodayAppointmentItem key={appt.appointmentID} appointment={appt} />
                ))
              ) : (
                <Typography color="textSecondary" textAlign="center" sx={{ py: 4 }}>
                  Không có lịch hẹn nào hôm nay.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Pending Requests and Medical Records */}
      <Grid container spacing={2}>
        <Grid size={{ xs:12, lg:6 }}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Yêu cầu chờ xử lý
            </Typography>
            <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {pendingRequests.length > 0 ? (
                pendingRequests.slice(0, 4).map(req => (
                  <PendingRequestItem key={req.requestID} request={req} />
                ))
              ) : (
                <Typography color="textSecondary" textAlign="center" sx={{ py: 4 }}>
                  Không có yêu cầu chờ xử lý.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs:12, lg:6 }}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Hồ sơ y tế gần đây
            </Typography>
            <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {dashboardData.recentMedicalRecords.map(record => (
                <Box
                  key={record.recordID}
                  sx={{
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {record.member.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      {record.diagnosis}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {format(parseISO(record.recordDate), 'dd/MM/yyyy')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
