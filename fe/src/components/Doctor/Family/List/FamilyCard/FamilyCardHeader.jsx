import { Box, Chip, Grid, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const getStatusConfig = (status) => {
  switch (status) {
    case 'active':
      return { label: 'Đang điều trị', color: 'success' };
    case 'monitoring':
      return { label: 'Theo dõi định kỳ', color: 'warning' };
    default:
      return { label: 'Bình thường', color: 'default' };
  }
};

const FamilyCardHeader = ({ family }) => {
  const statusConfig = family.status ? getStatusConfig(family.status) : null;

  return (
    <Grid container spacing={1} alignItems="flex-start">
      <Grid item xs>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {family.familyName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'start', color: 'text.secondary' }}>
          <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, mt: 0.2, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            {family.familyAddress}
          </Typography>
        </Box>
      </Grid>
      
      {statusConfig && (
        <Grid item>
          <Chip 
            label={statusConfig.label} 
            color={statusConfig.color} 
            size="small"
          />
        </Grid>
      )}
    </Grid>
  );
};

export default FamilyCardHeader;
