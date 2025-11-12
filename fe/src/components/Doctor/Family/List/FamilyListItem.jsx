import { Box, Card, CardContent, Grid } from '@mui/material';
import FamilyCardHeader from './FamilyCard/FamilyCardHeader';
import FamilyCardInfo from './FamilyCard/FamilyCardInfo';
import FamilyCardActions from './FamilyCard/FamilyCardActions';

const FamilyListItem = ({ family, onSelect }) => {
  return (
    <Card
      variant="outlined"
      onClick={() => onSelect(family)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5 } }}>
        <Grid container direction="column" spacing={2} sx={{ height: '100%' }}>
          <Grid item>
            <FamilyCardHeader family={family} />
          </Grid>

          <Grid item sx={{ flexGrow: 1 }}>
            <FamilyCardInfo family={family} />
          </Grid>

          <Grid item>
            <FamilyCardActions family={family} onSelect={onSelect} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FamilyListItem;
