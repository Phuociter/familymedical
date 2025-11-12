import { Card, CardContent, Divider, Grid, Skeleton, Stack } from '@mui/material';

const FamilyCardSkeleton = () => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5 } }}>
        <Grid container direction="column" spacing={2}>
          {/* Header */}
          <Grid item>
            <Grid container spacing={1} alignItems="flex-start">
              <Grid item xs>
                <Skeleton variant="text" width="75%" height={32} sx={{ mb: 1 }} />
                <Stack direction="row" spacing={0.5} alignItems="flex-start">
                  <Skeleton variant="circular" width={16} height={16} sx={{ mt: 0.5 }} />
                  <Skeleton variant="text" width="100%" height={20} />
                </Stack>
              </Grid>
              <Grid item>
                <Skeleton variant="rounded" width={90} height={24} />
              </Grid>
            </Grid>
          </Grid>

          {/* Divider */}
          <Grid item>
            <Divider />
          </Grid>

          {/* Info */}
          <Grid item sx={{ flexGrow: 1 }}>
            <Stack spacing={1.5}>
              <Skeleton variant="text" width="70%" height={20} />
              
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Skeleton variant="text" width="80%" height={20} />
                </Grid>
                <Grid item>
                  <Skeleton variant="rounded" width={100} height={24} />
                </Grid>
              </Grid>
              
              <Skeleton variant="text" width="50%" height={20} />
            </Stack>
          </Grid>

          {/* Actions */}
          <Grid item>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <Skeleton variant="rounded" height={36} />
              </Grid>
              <Grid item xs={4}>
                <Skeleton variant="rounded" height={36} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const FamilyListSkeleton = ({ count = 6 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <FamilyCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
};

export default FamilyListSkeleton;
