import { Box, Paper, Skeleton, Stack } from '@mui/material';

const DayCardSkeleton = () => (
  <Box
    sx={{
      minHeight: 400,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: 1,
      bgcolor: 'background.paper',
    }}
  >
    {/* Day Header Skeleton */}
    <Box sx={{ textAlign: 'center', mb: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Skeleton variant="text" width={40} height={16} sx={{ mx: 'auto', mb: 0.5 }} />
      <Skeleton variant="text" width={30} height={32} sx={{ mx: 'auto' }} />
    </Box>

    {/* Appointments Skeleton */}
    <Stack spacing={1}>
      {[...Array(3)].map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: 'background.default',
          }}
        >
          <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="70%" height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="rounded" width={60} height={18} />
        </Box>
      ))}
    </Stack>
  </Box>
);

export default function AppointmentCalendarSkeleton() {
  return (
    <Paper sx={{ p: 2 }}>
      {/* Week Navigation Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={250} height={32} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>

      {/* Calendar Grid Skeleton */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {[...Array(7)].map((_, index) => (
          <DayCardSkeleton key={index} />
        ))}
      </Box>
    </Paper>
  );
}
