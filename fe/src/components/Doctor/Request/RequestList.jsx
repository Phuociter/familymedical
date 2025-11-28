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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
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
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minMembers, setMinMembers] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'members'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  const statusFilter = tabValue === 0 ? 'PENDING' : tabValue === 1 ? 'ACCEPTED' : 'REJECTED';

  // Count active filters
  const activeFiltersCount = [
    dateFrom,
    dateTo,
    minMembers,
    maxMembers,
  ].filter(Boolean).length;

  const filteredRequests = requests
    .filter(req => req.status === statusFilter)
    .filter(req => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const familyName = req.family?.familyName?.toLowerCase() || '';
      const familyAddress = req.family?.familyAddress?.toLowerCase() || '';
      return familyName.includes(searchLower) || familyAddress.includes(searchLower);
    })
    .filter(req => {
      // Date filter
      if (dateFrom || dateTo) {
        const requestDate = new Date(req.requestDate);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (requestDate < fromDate) return false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (requestDate > toDate) return false;
        }
      }
      
      // Members count filter
      const memberCount = req.family?.members?.length || 0;
      if (minMembers && memberCount < parseInt(minMembers)) return false;
      if (maxMembers && memberCount > parseInt(maxMembers)) return false;
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.requestDate) - new Date(b.requestDate);
          break;
        case 'name':
          const nameA = (a.family?.familyName || '').toLowerCase();
          const nameB = (b.family?.familyName || '').toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case 'members':
          const membersA = a.family?.members?.length || 0;
          const membersB = b.family?.members?.length || 0;
          comparison = membersA - membersB;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setMinMembers('');
    setMaxMembers('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const handleApplyFilters = () => {
    setFilterDialogOpen(false);
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
            onClick={handleOpenFilterDialog}
            sx={{ minWidth: 100 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Lọc
              {activeFiltersCount > 0 && (
                <Badge
                  badgeContent={activeFiltersCount}
                  color="primary"
                />
              )}
            </Box>
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

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Bộ lọc nâng cao</Typography>
            <IconButton onClick={handleCloseFilterDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Date Range */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Khoảng thời gian
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Members Count */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Số thành viên
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Tối thiểu"
                type="number"
                value={minMembers}
                onChange={(e) => setMinMembers(e.target.value)}
                size="small"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Tối đa"
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                size="small"
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Sort Options */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Sắp xếp
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={sortBy}
                  label="Sắp xếp theo"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="date">Ngày yêu cầu</MenuItem>
                  <MenuItem value="name">Tên gia đình</MenuItem>
                  <MenuItem value="members">Số thành viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  value={sortOrder}
                  label="Thứ tự"
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <MenuItem value="desc">Giảm dần</MenuItem>
                  <MenuItem value="asc">Tăng dần</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleResetFilters} color="inherit">
            Đặt lại
          </Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
