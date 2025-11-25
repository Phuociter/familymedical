import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Box,
  Tabs,
  Tab,
  Button,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  List as ListIcon,
} from '@mui/icons-material';
import AppointmentCalendar from '../../components/Doctor/Appointment/AppointmentCalendar';
import AppointmentList from '../../components/Doctor/Appointment/AppointmentList';
import AppointmentCalendarSkeleton from '../../components/Doctor/Appointment/AppointmentCalendarSkeleton';
import AppointmentListSkeleton from '../../components/Doctor/Appointment/AppointmentListSkeleton';
import CreateAppointmentDialog from '../../components/Doctor/Appointment/CreateAppointmentDialog';
import AppointmentDetailDialog from '../../components/Doctor/Appointment/AppointmentDetailDialog';
import { 
  GET_APPOINTMENTS, 
  GET_TODAY_APPOINTMENTS, 
  GET_UPCOMING_APPOINTMENTS 
} from '../../graphql/doctorQueries';

export default function DoctorAppointmentsPage() {
  // Load viewMode from localStorage, default to 'calendar'
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('appointmentViewMode');
    return saved || 'calendar';
  });
  const [selectedTab, setSelectedTab] = useState(1); // 0: All, 1: Today, 2: Upcoming, 3: Past
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // GraphQL queries based on selected tab
  const { data: allData, loading: allLoading, error: allError, refetch: refetchAll } = useQuery(
    GET_APPOINTMENTS,
    { 
      skip: selectedTab !== 0,
      fetchPolicy: 'cache-and-network'
    }
  );

  const { data: todayData, loading: todayLoading, error: todayError, refetch: refetchToday } = useQuery(
    GET_TODAY_APPOINTMENTS,
    { 
      skip: selectedTab !== 1,
      fetchPolicy: 'cache-and-network'
    }
  );

  const { data: upcomingData, loading: upcomingLoading, error: upcomingError, refetch: refetchUpcoming } = useQuery(
    GET_UPCOMING_APPOINTMENTS,
    { 
      skip: selectedTab !== 2,
      fetchPolicy: 'cache-and-network'
    }
  );

  const { data: pastData, loading: pastLoading, error: pastError, refetch: refetchPast } = useQuery(
    GET_APPOINTMENTS,
    {
      variables: {
        filter: {
          status: 'COMPLETED'
        }
      },
      skip: selectedTab !== 3,
      fetchPolicy: 'cache-and-network'
    }
  );

  // Determine current data and loading state
  const getCurrentData = () => {
    switch (selectedTab) {
      case 0:
        return { data: allData?.appointments || [], loading: allLoading, error: allError };
      case 1:
        return { data: todayData?.todayAppointments || [], loading: todayLoading, error: todayError };
      case 2:
        return { data: upcomingData?.upcomingAppointments || [], loading: upcomingLoading, error: upcomingError };
      case 3:
        return { data: pastData?.appointments || [], loading: pastLoading, error: pastError };
      default:
        return { data: [], loading: false, error: null };
    }
  };

  const { data: appointments, loading, error } = getCurrentData();

  // Refetch function based on current tab
  const refetchAppointments = () => {
    switch (selectedTab) {
      case 0:
        refetchAll();
        break;
      case 1:
        refetchToday();
        break;
      case 2:
        refetchUpcoming();
        break;
      case 3:
        refetchPast();
        break;
      default:
        break;
    }
  };

  // Save viewMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appointmentViewMode', viewMode);
  }, [viewMode]);

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const handleCreateAppointment = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentCreated = () => {
    refetchAppointments();
  };

  const handleAppointmentUpdated = () => {
    refetchAppointments();
  };

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Không thể tải danh sách lịch hẹn: {error.message}
        </Alert>
      )}
      {/* Tabs, View Mode & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            bgcolor: '#e5e7eb',
            borderRadius: 1,
            p: 0.5,
            display: 'inline-flex',
          }}
        >
          <Tabs 
            value={selectedTab} 
            onChange={(_, v) => setSelectedTab(v)}
            sx={{
              minHeight: 'auto',
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
          <Tab 
            label="Tất cả"
            sx={{
              minHeight: 'auto',
              py: 1,
              px: 2,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          />
          <Tab 
            label="Hôm nay"
            sx={{
              minHeight: 'auto',
              py: 1,
              px: 2,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          />
          <Tab 
            label="Sắp tới"
            sx={{
              minHeight: 'auto',
              py: 1,
              px: 2,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          />
          <Tab 
            label="Đã qua"
            sx={{
              minHeight: 'auto',
              py: 1,
              px: 2,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          />
          </Tabs>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setViewMode('calendar')}
            disabled={viewMode === 'calendar'}
            sx={{
              bgcolor: viewMode === 'calendar' ? 'primary.main' : 'transparent',
              color: viewMode === 'calendar' ? 'white' : 'action.active',
              '&:hover': {
                bgcolor: viewMode === 'calendar' ? 'primary.main' : 'action.hover',
              },
              '&.Mui-disabled': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <CalendarIcon />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('list')}
            disabled={viewMode === 'list'}
            sx={{
              bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
              color: viewMode === 'list' ? 'white' : 'action.active',
              borderRadius: 1,
              '&:hover': {
                bgcolor: viewMode === 'list' ? 'primary.main' : 'action.hover',
              },
              '&.Mui-disabled': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <ListIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateAppointment}
            sx={{ ml: 1 }}
          >
            Tạo lịch hẹn
          </Button>
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        viewMode === 'calendar' ? (
          <AppointmentCalendarSkeleton />
        ) : (
          <AppointmentListSkeleton />
        )
      ) : viewMode === 'calendar' ? (
        <AppointmentCalendar
          appointments={appointments}
          onAppointmentClick={handleAppointmentClick}
          selectedTab={selectedTab}
        />
      ) : (
        <AppointmentList
          appointments={appointments}
          onAppointmentClick={handleAppointmentClick}
          selectedTab={selectedTab}
        />
      )}

      {/* Dialogs */}
      <CreateAppointmentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onAppointmentCreated={handleAppointmentCreated}
      />

      {selectedAppointment && (
        <AppointmentDetailDialog
          open={detailDialogOpen}
          appointment={selectedAppointment}
          onClose={handleCloseDetailDialog}
          onAppointmentUpdated={handleAppointmentUpdated}
        />
      )}
    </Box>
  );
}
