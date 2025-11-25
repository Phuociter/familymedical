import { Box, Paper, Skeleton, Stack } from '@mui/material';

const ChartSkeleton = () => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
    <Box sx={{ width: '100%', height: 350, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
      {[...Array(7)].map((_, index) => (
        <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={Math.random() * 200 + 100}
            sx={{ borderRadius: '4px 4px 0 0' }}
          />
          <Skeleton variant="text" width="80%" height={20} />
        </Box>
      ))}
    </Box>
  </Paper>
);

export default ChartSkeleton;
