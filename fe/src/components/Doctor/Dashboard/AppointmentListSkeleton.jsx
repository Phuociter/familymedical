import { Box, Paper, Skeleton, Stack } from '@mui/material';

const AppointmentItemSkeleton = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="80%" height={20} />
      </Box>
    </Box>
    <Box sx={{ textAlign: 'right' }}>
      <Skeleton variant="text" width={60} height={24} sx={{ mb: 0.5 }} />
      <Skeleton variant="rounded" width={80} height={24} />
    </Box>
  </Box>
);

const AppointmentListSkeleton = () => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
    <Stack spacing={0}>
      {[...Array(4)].map((_, index) => (
        <AppointmentItemSkeleton key={index} />
      ))}
    </Stack>
  </Paper>
);

export default AppointmentListSkeleton;
