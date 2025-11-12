import { Button, Grid } from '@mui/material';

const FamilyCardActions = ({ family, onSelect }) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onSelect(family);
          }}
        >
          Xem chi tiết
        </Button>
      </Grid>
      <Grid item xs={4}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={(e) => e.stopPropagation()}
        >
          Lịch hẹn
        </Button>
      </Grid>
    </Grid>
  );
};

export default FamilyCardActions;
