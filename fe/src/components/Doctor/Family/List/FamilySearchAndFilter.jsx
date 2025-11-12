import { Box, TextField, InputAdornment, FormControl, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const FamilySearchAndFilter = ({ 
  searchValue, 
  onSearchChange, 
  statusFilter, 
  onStatusChange 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'stretch', sm: 'center' }
    }}>
      {/* Search Bar - Chiếm phần lớn không gian */}
      <TextField
        fullWidth
        placeholder="Tìm kiếm theo tên gia đình, chủ hộ, địa chỉ..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ flex: 1 }}
      />

      {/* Status Filter */}
      <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
        <Select
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
    </Box>
  );
};

export default FamilySearchAndFilter;