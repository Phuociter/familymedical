import { Box, Paper, Skeleton, Stack } from '@mui/material';

const MedicalRecordItemSkeleton = () => (
  <Box
    sx={{
      py: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
      <Skeleton variant="text" width="50%" height={20} />
      <Skeleton variant="text" width="25%" height={20} />
    </Box>
  </Box>
);

const MedicalRecordListSkeleton = () => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
    <Stack spacing={0}>
      {[...Array(5)].map((_, index) => (
        <MedicalRecordItemSkeleton key={index} />
      ))}
    </Stack>
  </Paper>
);

export default MedicalRecordListSkeleton;
