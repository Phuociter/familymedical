import { Grid } from '@mui/material';
import FamilyListItem from './FamilyListItem';

const FamilyGrid = ({ families, onFamilySelect }) => {
  return (
    <Grid container spacing={3} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        
        {Array.from(families).map((family, index) => (
            <Grid key={index} size={{ xs: 2, sm: 4, md: 4 }}>
            <FamilyListItem
                family={family}
                onSelect={onFamilySelect}
            />
            </Grid>
        ))}
    </Grid>
  );
};

export default FamilyGrid;
