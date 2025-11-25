import { Box, Paper, Skeleton, Stack } from '@mui/material';

const RequestItemSkeleton = () => (
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
    <Box sx={{ flex: 1, mr: 2 }}>
      <Skeleton variant="text" width="50%" height={24} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="90%" height={20} />
    </Box>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="circular" width={32} height={32} />
    </Box>
  </Box>
);

const RequestListSkeleton = () => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
    <Stack spacing={0}>
      {[...Array(4)].map((_, index) => (
        <RequestItemSkeleton key={index} />
      ))}
    </Stack>
  </Paper>
);

export default RequestListSkeleton;
