import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  Chip,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

const statusConfig = {
  PENDING: { label: 'Chờ xử lý', color: 'warning', icon: <PendingIcon /> },
  ACCEPTED: { label: 'Đã chấp nhận', color: 'success', icon: <CheckCircleIcon /> },
  REJECTED: { label: 'Đã từ chối', color: 'error', icon: <CancelIcon /> },
};

export default function RequestDetailDialog({ open, onClose, request, onRespond, loading }) {
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  if (!request) return null;

  const status = statusConfig[request.status];

  const handleAcceptClick = () => {
    setActionType('ACCEPTED');
    setShowResponseInput(true);
  };

  const handleRejectClick = () => {
    setActionType('REJECTED');
    setShowResponseInput(true);
  };

  const handleSubmit = () => {
    onRespond(actionType, responseMessage);
    setShowResponseInput(false);
    setActionType(null);
    setResponseMessage('');
  };

  const handleCancel = () => {
    setShowResponseInput(false);
    setActionType(null);
    setResponseMessage('');
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Chi tiết yêu cầu</Typography>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            icon={status.icon}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {!showResponseInput ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Tên gia đình
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {request.family.familyName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon fontSize="small" color="action" />
              <Typography variant="body2">{request.family.familyAddress}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2">{request.family.members.length} thành viên</Typography>
            </Box>

            {request.family.headOfFamily && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Thông tin chủ hộ
                  </Typography>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    {request.family.headOfFamily.fullName}
                  </Typography>
                  {request.family.headOfFamily.phoneNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{request.family.headOfFamily.phoneNumber}</Typography>
                    </Box>
                  )}
                  {request.family.headOfFamily.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{request.family.headOfFamily.email}</Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Ngày yêu cầu
              </Typography>
              <Typography variant="body2">
                {new Date(request.requestDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>

            {request.message && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Lời nhắn từ gia đình
                </Typography>
                <Typography variant="body2">"{request.message}"</Typography>
              </Box>
            )}

            {request.responseMessage && (
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Phản hồi của bạn
                </Typography>
                <Typography variant="body2">{request.responseMessage}</Typography>
              </Box>
            )}
          </Stack>
        ) : (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {actionType === 'ACCEPTED' 
                ? 'Bạn đang chấp nhận yêu cầu từ gia đình: '
                : 'Bạn đang từ chối yêu cầu từ gia đình: '
              }
              <strong>{request.family.familyName}</strong>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={actionType === 'ACCEPTED' ? 'Lời nhắn (tùy chọn)' : 'Lý do từ chối (tùy chọn)'}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder={
                actionType === 'ACCEPTED'
                  ? 'Ví dụ: Tôi rất vui được đồng hành cùng gia đình...'
                  : 'Ví dụ: Hiện tại lịch làm việc của tôi đã đầy...'
              }
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {!showResponseInput ? (
          <>
            <Button onClick={handleClose}>Đóng</Button>
            {request.status === 'PENDING' && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRejectClick}
                  startIcon={<CancelIcon />}
                >
                  Từ chối
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAcceptClick}
                  startIcon={<CheckCircleIcon />}
                >
                  Chấp nhận
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Button onClick={handleCancel} disabled={loading}>
              Hủy
            </Button>
            <Button
              variant="contained"
              color={actionType === 'ACCEPTED' ? 'success' : 'error'}
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {actionType === 'ACCEPTED' ? 'Xác nhận chấp nhận' : 'Xác nhận từ chối'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
