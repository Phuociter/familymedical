import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { format, parseISO, isSameDay, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { APPOINTMENT_STATUS } from '../../../mocks/appointmentsMockData';

export default function AppointmentList({ appointments, onAppointmentClick, selectedTab }) {
  const [searchTerm, setSearchTerm] = useState('');

  const calcAge = (dateOfBirth) => {
    if (!dateOfBirth) return null; // hoặc 0, hoặc giá trị mặc định bạn muốn

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Nếu chưa đến sinh nhật năm nay thì giảm 1 tuổi
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  // Filter appointments based on selected tab
  const filterAppointments = () => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...appointments];

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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.familyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => 
      parseISO(a.appointmentDateTime) - parseISO(b.appointmentDateTime)
    );
  };

  const filteredAppointments = filterAppointments();

  return (
    <Paper>
      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm theo tên bệnh nhân hoặc gia đình..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bệnh nhân</TableCell>
            <TableCell>Gia đình</TableCell>
            <TableCell>Thời gian khám</TableCell>
            <TableCell>Địa điểm</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAppointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="textSecondary">
                  {searchTerm 
                    ? 'Không tìm thấy lịch hẹn nào phù hợp'
                    : 'Không có lịch hẹn nào'
                  }
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredAppointments.map((apt) => {
              const aptDate = parseISO(apt.appointmentDateTime);
              const isTodayApt = isToday(aptDate);
              
              return (
                <TableRow
                  key={apt.appointmentID}
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: isTodayApt ? 'primary.50' : 'transparent',
                  }}
                  onClick={() => onAppointmentClick(apt)}
                >
                  {/* Patient Info */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={`https://i.pravatar.cc/150?u=${apt.memberID}`}
                        alt={apt.memberName}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {apt.member.fullName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {apt.member.gender}, {calcAge(apt.member.dateOfBirth)} tuổi
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Family */}
                  <TableCell>
                    <Typography variant="body2">
                      {apt.family.familyName}
                    </Typography>
                  </TableCell>

                  {/* Time */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} gutterBottom>
                      {format(aptDate, 'HH:mm')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(aptDate, 'dd/MM/yyyy', { locale: vi })}
                    </Typography>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <Typography variant="body2">
                      {apt.location || '-'}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    <Chip
                      label={APPOINTMENT_STATUS[apt.status].label}
                      size="small"
                      color={APPOINTMENT_STATUS[apt.status].color}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
