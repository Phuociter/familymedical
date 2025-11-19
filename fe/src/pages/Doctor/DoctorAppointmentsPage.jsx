import { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Button,
  IconButton,
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
import { getMockAppointments } from '../../mocks/appointmentsMockData';

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
  const [loading, setLoading] = useState(true);

  const appointments = getMockAppointments();

  // Save viewMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appointmentViewMode', viewMode);
  }, [viewMode]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <Box>
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
      />

      {selectedAppointment && (
        <AppointmentDetailDialog
          open={detailDialogOpen}
          appointment={selectedAppointment}
          onClose={handleCloseDetailDialog}
        />
      )}
    </Box>
  );
}
