import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { APPOINTMENT_STATUS } from '../../../mocks/appointmentsMockData';

export default function AppointmentCalendar({ appointments, onAppointmentClick, selectedTab }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const filterAppointments = (date) => {
    let filtered = appointments.filter(apt => 
      isSameDay(parseISO(apt.appointmentDateTime), date)
    );

    // Apply tab filter
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (selectedTab) {
      case 1: // Today
        filtered = filtered.filter(apt => isSameDay(parseISO(apt.appointmentDateTime), today));
        break;
      case 2: // Upcoming
        filtered = filtered.filter(apt => parseISO(apt.appointmentDateTime) > now && apt.status !== 'CANCELLED');
        break;
      case 3: // Past
        filtered = filtered.filter(apt => parseISO(apt.appointmentDateTime) < now || apt.status === 'COMPLETED');
        break;
      default: // All
        break;
    }

    return filtered.sort((a, b) => 
      parseISO(a.appointmentDateTime) - parseISO(b.appointmentDateTime)
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      {/* Week Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handlePrevWeek}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          {format(weekStart, 'dd MMMM', { locale: vi })} - {format(addDays(weekStart, 6), 'dd MMMM yyyy', { locale: vi })}
        </Typography>
        <IconButton onClick={handleNextWeek}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {weekDays.map((day, index) => {
          const dayAppointments = filterAppointments(day);
          const isToday = isSameDay(day, new Date());

          return (
            <Box
              key={index}
              sx={{
                minHeight: 400,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                bgcolor: isToday ? 'primary.light' : 'background.paper',
              }}
            >
              {/* Day Header */}
              <Box sx={{ textAlign: 'center', mb: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  {format(day, 'EEE', { locale: vi })}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    color: isToday ? 'primary.main' : 'text.primary',
                  }}
                >
                  {format(day, 'd')}
                </Typography>
              </Box>

              {/* Appointments */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {dayAppointments.map(apt => (
                  <Box
                    key={apt.appointmentID}
                    onClick={() => onAppointmentClick(apt)}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)',
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} display="block" noWrap>
                      {format(parseISO(apt.appointmentDateTime), 'HH:mm')}
                    </Typography>
                    <Typography variant="caption" display="block" noWrap sx={{ mb: 0.5 }}>
                      {apt.memberName}
                    </Typography>
                    <Chip
                      label={APPOINTMENT_STATUS[apt.status].label}
                      size="small"
                      color={APPOINTMENT_STATUS[apt.status].color}
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
