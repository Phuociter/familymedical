import { Avatar, Paper, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';

const FamilyEmptyState = ({ hasFilters }) => {
  return (
    <Paper sx={{ py: 8, textAlign: 'center' }}>
      <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.100', mx: 'auto', mb: 2 }}>
        <GroupIcon sx={{ fontSize: 32, color: 'grey.400' }} />
      </Avatar>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Không tìm thấy gia đình nào
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {hasFilters 
          ? 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm'
          : 'Chưa có gia đình nào trong hệ thống'}
      </Typography>
    </Paper>
  );
};

export default FamilyEmptyState;
