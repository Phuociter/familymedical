import { Avatar, Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const FamilyErrorState = ({ error }) => {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Avatar sx={{ width: 64, height: 64, bgcolor: 'error.light', mx: 'auto', mb: 2 }}>
        <ErrorOutlineIcon sx={{ fontSize: 32, color: 'error.main' }} />
      </Avatar>
      <Typography variant="h6" color="error" gutterBottom>
        Lỗi khi tải danh sách gia đình
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error.message}
      </Typography>
    </Box>
  );
};

export default FamilyErrorState;
