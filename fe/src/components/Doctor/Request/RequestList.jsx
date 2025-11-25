import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Button,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

const statusConfig = {
  PENDING: { label: 'Chờ xử lý', color: 'warning', icon: <PendingIcon fontSize="small" /> },
  ACCEPTED: { label: 'Đã chấp nhận', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  REJECTED: { label: 'Đã từ chối', color: 'error', icon: <CancelIcon fontSize="small" /> },
};

export default function RequestList({
  requests = [],
  loading = false,
  error = null,
  onRequestClick,
}) {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const statusFilter = tabValue === 0 ? 'PENDING' : tabValue === 1 ? 'ACCEPTED' : 'REJECTED';

  const filteredRequests = requests
    .filter(req => req.status === statusFilter)
    .filter(req => 
      !searchTerm || 
      req.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.familyAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
  };

  const pendingCount = requests.filter(req => req.status === 'PENDING').length;
  const acceptedCount = requests.filter(req => req.status === 'ACCEPTED').length;
  const rejectedCount = requests.filter(req => req.status === 'REJECTED').length;

  return (
    <Box>
      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">
            Lỗi: {error.message}
          </Typography>
        </Paper>
      )}

      <Paper>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ flexGrow: 1 }}>
            <Tab 
              label={
                <Badge badgeContent={pendingCount} color="warning">
                  <Box sx={{ pr: pendingCount > 0 ? 2 : 0 }}>Chờ xử lý</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={acceptedCount} color="success">
                  <Box sx={{ pr: acceptedCount > 0 ? 2 : 0 }}>Đã chấp nhận</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={rejectedCount} color="error">
                  <Box sx={{ pr: rejectedCount > 0 ? 2 : 0 }}>Đã từ chối</Box>
                </Badge>
              } 
            />
          </Tabs>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{ minWidth: 100 }}
          >
            Lọc
          </Button>
        </Box>
        
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm theo tên, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên gia đình</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell align="center">Số thành viên</TableCell>
              <TableCell>Ngày yêu cầu</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    {searchTerm 
                      ? 'Không tìm thấy yêu cầu nào phù hợp'
                      : 'Không có yêu cầu nào trong danh mục này'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => {
                const status = statusConfig[request.status];
                return (
                  <TableRow 
                    key={request.requestID}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onRequestClick(request)}
                  >
                    <TableCell>{request.family.familyName}</TableCell>
                    <TableCell>{request.family.familyAddress}</TableCell>
                    <TableCell align="center">{request.family.members.length}</TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        icon={status.icon}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
