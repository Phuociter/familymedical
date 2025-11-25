import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

const FamilyCardSkeleton = () => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5 } }}>
        <Grid container direction="column" spacing={2} sx={{ height: '100%' }}>
          {/* Header Section */}
          <Grid item>
            <Grid container spacing={1} alignItems="flex-start">
              <Grid item xs>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'start' }}>
                  <Skeleton variant="circular" width={16} height={16} sx={{ mr: 0.5, mt: 0.2 }} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Box>
              </Grid>
              <Grid item>
                <Skeleton variant="rounded" width={100} height={24} />
              </Grid>
            </Grid>
          </Grid>

          {/* Info Section */}
          <Grid item sx={{ flexGrow: 1 }}>
            <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Skeleton variant="text" width="70%" height={20} />
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={16} height={16} sx={{ mr: 0.5 }} />
                <Skeleton variant="text" width="50%" height={20} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={16} height={16} sx={{ mr: 0.5 }} />
                <Skeleton variant="text" width="45%" height={20} />
              </Box>
            </Stack>
          </Grid>

          {/* Actions Section */}
          <Grid item>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <Skeleton variant="rounded" width="100%" height={32} />
              </Grid>
              <Grid item xs={4}>
                <Skeleton variant="rounded" width="100%" height={32} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FamilyCardSkeleton;
