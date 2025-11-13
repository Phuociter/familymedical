import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const FamilySearchBar = ({ value, onChange }) => {
  return (
    <TextField
      fullWidth
      placeholder="Tìm kiếm theo tên gia đình, chủ hộ, địa chỉ..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default FamilySearchBar;
