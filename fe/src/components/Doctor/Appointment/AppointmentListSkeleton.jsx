import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

const AppointmentRowSkeleton = () => (
  <TableRow>
    {/* Patient Info */}
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={16} />
        </Box>
      </Box>
    </TableCell>

    {/* Appointment Info */}
    <TableCell>
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
      <Skeleton variant="rounded" width={80} height={20} />
    </TableCell>

    {/* Time */}
    <TableCell>
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="90%" height={16} />
    </TableCell>

    {/* Location */}
    <TableCell>
      <Skeleton variant="text" width="70%" height={20} />
    </TableCell>

    {/* Status */}
    <TableCell align="center">
      <Skeleton variant="rounded" width={80} height={24} sx={{ mx: 'auto' }} />
    </TableCell>
  </TableRow>
);

export default function AppointmentListSkeleton() {
  return (
    <Paper>
      {/* Search Bar Skeleton */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Skeleton variant="rounded" width="100%" height={40} />
      </Box>

      {/* Table Skeleton */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bệnh nhân</TableCell>
            <TableCell>Lịch hẹn</TableCell>
            <TableCell>Thời gian</TableCell>
            <TableCell>Địa điểm</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(6)].map((_, index) => (
            <AppointmentRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
