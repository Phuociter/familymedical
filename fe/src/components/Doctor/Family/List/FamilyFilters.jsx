import { Button, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';

const FamilyFilters = ({ 
  areaFilter, 
  statusFilter, 
  areas, 
  onAreaChange, 
  onStatusChange, 
  onClearFilters 
}) => {
  const hasActiveFilters = areaFilter || statusFilter;

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={6} md={5}>
        <FormControl fullWidth>
          <Select
            labelId="area-filter-label"
            id="area-filter"
            value={areaFilter}
            onChange={(e) => onAreaChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Tất cả khu vực</MenuItem>
            {areas.map(area => (
              <MenuItem key={area} value={area}>{area}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={5}>
        <FormControl fullWidth>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            <MenuItem value="active">Đang điều trị</MenuItem>
            <MenuItem value="monitoring">Theo dõi định kỳ</MenuItem>
            <MenuItem value="normal">Bình thường</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {hasActiveFilters && (
        <Grid item xs={12} md={2}>
          <Button
            variant="text"
            startIcon={<FilterListOffIcon />}
            onClick={onClearFilters}
            fullWidth
            sx={{ whiteSpace: 'nowrap' }}
          >
            Xóa bộ lọc
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default FamilyFilters;
