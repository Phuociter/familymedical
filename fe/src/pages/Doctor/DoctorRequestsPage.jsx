import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Stack,
} from '@mui/material';
import {
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { GET_DOCTOR_REQUESTS } from '../../graphql/doctorMutations';
import { RESPOND_TO_DOCTOR_REQUEST } from '../../graphql/doctorMutations';
import { MOCK_DOCTOR_REQUESTS, getRequestsByStatus } from '../../mocks/doctorRequestsMockData';

const statusConfig = {
  PENDING: { label: 'Chờ xử lý', color: 'warning', icon: <PendingIcon /> },
  ACCEPTED: { label: 'Đã chấp nhận', color: 'success', icon: <CheckCircleIcon /> },
  REJECTED: { label: 'Đã từ chối', color: 'error', icon: <CancelIcon /> },
};

export default function DoctorRequestsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionType, setActionType] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [mockRequests, setMockRequests] = useState(MOCK_DOCTOR_REQUESTS);

  const statusFilter = tabValue === 0 ? 'PENDING' : tabValue === 1 ? 'ACCEPTED' : 'REJECTED';

  const { data, loading, error, refetch } = useQuery(GET_DOCTOR_REQUESTS, {
    variables: { status: statusFilter },
    fetchPolicy: 'cache-and-network',
    skip: useMockData,
  });

  // Detect if backend is unavailable and switch to mock data
  useEffect(() => {
    if (error && error.message.includes('fetch')) {
      setUseMockData(true);
      console.log('Backend unavailable, using mock data');
    }
  }, [error]);

  const [respondToRequest, { loading: responding }] = useMutation(RESPOND_TO_DOCTOR_REQUEST, {
    onCompleted: () => {
      setDialogOpen(false);
      setSelectedRequest(null);
      setResponseMessage('');
      if (!useMockData) {
        refetch();
      }
    },
    onError: (error) => {
      console.error('Error responding to request:', error);
      setUseMockData(true);
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setResponseMessage('');
    setActionType(null);
  };

  const handleSubmitResponse = () => {
    if (!selectedRequest) return;

    if (useMockData) {
      // Handle mock data response
      const updatedRequests = mockRequests.map(req => {
        if (req.requestID === selectedRequest.requestID) {
          return {
            ...req,
            status: actionType,
            responseDate: new Date().toISOString(),
            responseMessage: responseMessage || null,
          };
        }
        return req;
      });
      setMockRequests(updatedRequests);
      setDialogOpen(false);
      setSelectedRequest(null);
      setResponseMessage('');
    } else {
      respondToRequest({
        variables: {
          requestId: selectedRequest.requestID,
          status: actionType,
          message: responseMessage || undefined,
        },
      });
    }
  };

  const requests = useMockData 
    ? mockRequests.filter(req => req.status === statusFilter)
    : (data?.doctorRequests || []);

  if (loading && !data && !useMockData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý yêu cầu phân công
        </Typography>
        {useMockData && (
          <Chip 
            label="Mock Data" 
            color="info" 
            size="small" 
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Chờ xử lý" />
          <Tab label="Đã chấp nhận" />
          <Tab label="Đã từ chối" />
        </Tabs>
      </Paper>

      {requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            Không có yêu cầu nào trong danh mục này
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} md={6} key={request.requestID}>
              <RequestCard
                request={request}
                onAccept={() => handleOpenDialog(request, 'ACCEPTED')}
                onReject={() => handleOpenDialog(request, 'REJECTED')}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ResponseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        request={selectedRequest}
        actionType={actionType}
        message={responseMessage}
        onMessageChange={setResponseMessage}
        onSubmit={handleSubmitResponse}
        loading={responding}
      />
    </Box>
  );
}

function RequestCard({ request, onAccept, onReject }) {
  const status = statusConfig[request.status];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {request.familyName}
          </Typography>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            icon={status.icon}
          />
        </Box>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {request.familyAddress}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {request.memberCount} thành viên
            </Typography>
          </Box>

          {request.headOfFamily && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="textPrimary">
                Chủ hộ: {request.headOfFamily.fullName}
              </Typography>
              {request.headOfFamily.phoneNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    {request.headOfFamily.phoneNumber}
                  </Typography>
                </Box>
              )}
              {request.headOfFamily.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    {request.headOfFamily.email}
                  </Typography>
                </Box>
              )}
            </>
          )}

          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="textSecondary">
            Ngày yêu cầu: {new Date(request.requestDate).toLocaleDateString('vi-VN')}
          </Typography>

          {request.message && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                "{request.message}"
              </Typography>
            </Box>
          )}

          {request.responseMessage && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Typography variant="caption" color="primary" fontWeight={600}>
                Phản hồi của bạn:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {request.responseMessage}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      {request.status === 'PENDING' && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={onAccept}
            startIcon={<CheckCircleIcon />}
          >
            Chấp nhận
          </Button>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={onReject}
            startIcon={<CancelIcon />}
          >
            Từ chối
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

function ResponseDialog({ open, onClose, request, actionType, message, onMessageChange, onSubmit, loading }) {
  if (!request) return null;

  const isAccept = actionType === 'ACCEPTED';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isAccept ? 'Chấp nhận yêu cầu' : 'Từ chối yêu cầu'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Gia đình: <strong>{request.familyName}</strong>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={isAccept ? 'Lời nhắn (tùy chọn)' : 'Lý do từ chối (tùy chọn)'}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={
            isAccept
              ? 'Ví dụ: Tôi rất vui được đồng hành cùng gia đình...'
              : 'Ví dụ: Hiện tại lịch làm việc của tôi đã đầy...'
          }
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color={isAccept ? 'success' : 'error'}
          onClick={onSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {isAccept ? 'Xác nhận chấp nhận' : 'Xác nhận từ chối'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
