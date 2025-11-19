import { Box, Card, CardContent, Skeleton } from '@mui/material';

const StatCardSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton 
          variant="rounded" 
          width={56} 
          height={56} 
          sx={{ mr: 2, borderRadius: 2 }} 
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="40%" height={36} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatCardSkeleton;
