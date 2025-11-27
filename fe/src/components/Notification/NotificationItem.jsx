import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AssignmentInd as RequestIcon,
  Description as DocumentIcon,
  Message as MessageIcon,
  Notifications as BellIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Check as MarkReadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type) => {
  switch (type) {
    case 'APPOINTMENT_CREATED':
    case 'APPOINTMENT_UPDATED':
    case 'APPOINTMENT_CANCELLED':
      return <CalendarIcon />;
    case 'DOCTOR_REQUEST_CREATED':
    case 'DOCTOR_REQUEST_ACCEPTED':
    case 'DOCTOR_REQUEST_REJECTED':
      if (type === 'DOCTOR_REQUEST_ACCEPTED') return <CheckIcon />;
      if (type === 'DOCTOR_REQUEST_REJECTED') return <CancelIcon />;
      return <RequestIcon />;
    case 'MEDICAL_RECORD_CREATED':
    case 'MEDICAL_RECORD_UPDATED':
      return <DocumentIcon />;
    default:
      return <BellIcon />;
  }
};

/**
 * Get color for notification type
 */
const getNotificationColor = (type) => {
  switch (type) {
    case 'APPOINTMENT_CREATED':
    case 'NEW_MESSAGE':
    case 'DOCTOR_REQUEST_CREATED':
    case 'MEDICAL_RECORD_CREATED':
      return '#2563eb'; // Blue - High priority
    case 'APPOINTMENT_UPDATED':
    case 'MEDICAL_RECORD_UPDATED':
      return '#ed6c02'; // Orange - Medium priority
    case 'APPOINTMENT_CANCELLED':
    case 'DOCTOR_REQUEST_REJECTED':
      return '#d32f2f'; // Red - Cancelled/Rejected
    case 'DOCTOR_REQUEST_ACCEPTED':
      return '#2e7d32'; // Green - Accepted
    default:
      return '#757575'; // Gray
  }
};

/**
 * Format timestamp to relative time
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Vừa xong';
    }
    
    const result = formatDistanceToNow(date, { addSuffix: true });
    // Translate to Vietnamese if needed
    return result
      .replace('about ', '')
      .replace('less than a minute ago', 'Vừa xong')
      .replace('minute ago', 'phút trước')
      .replace('minutes ago', 'phút trước')
      .replace('hour ago', 'giờ trước')
      .replace('hours ago', 'giờ trước')
      .replace('day ago', 'ngày trước')
      .replace('days ago', 'ngày trước');
  } catch (error) {
    return '';
  }
};

/**
 * NotificationItem component
 * Displays a single notification item
 */
export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onClick,
  onDelete 
}) {
  const isUnread = !notification.isRead;
  const iconColor = getNotificationColor(notification.type);

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    if (isUnread && onMarkAsRead) {
      // Ensure notificationID is passed as Int
      const notificationID = typeof notification.notificationID === 'string' 
        ? parseInt(notification.notificationID, 10) 
        : notification.notificationID;
      onMarkAsRead(notificationID);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      const notificationID = typeof notification.notificationID === 'string' 
        ? parseInt(notification.notificationID, 10) 
        : notification.notificationID;
      onDelete(notificationID);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
    // Auto mark as read when clicked
    if (isUnread && onMarkAsRead) {
      // Ensure notificationID is passed as Int
      const notificationID = typeof notification.notificationID === 'string' 
        ? parseInt(notification.notificationID, 10) 
        : notification.notificationID;
      onMarkAsRead(notificationID);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        p: 1.5,
        px: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        backgroundColor: isUnread ? 'action.selected' : 'transparent',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        {/* Icon */}
        <Box
          sx={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isUnread ? iconColor : 'grey.300',
            color: 'white',
            '& svg': {
              fontSize: 18,
            },
          }}
        >
          {getNotificationIcon(notification.type)}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
            <Typography
              variant="body2"
              component="div"
              sx={{
                fontWeight: isUnread ? 600 : 400,
                fontSize: '0.875rem',
                color: 'text.primary',
                lineHeight: 1.4,
              }}
            >
              {notification.title}
            </Typography>
            {isUnread && (
              <Box
                sx={{
                  flexShrink: 0,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: iconColor,
                  mt: 0.75,
                }}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            component="div"
            color="text.secondary"
            sx={{
              fontSize: '0.8125rem',
              mb: 0.5,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {notification.message}
          </Typography>
          <Typography variant="caption" component="div" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {formatTimestamp(notification.createdAt)}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.25 }}>
          {isUnread && (
            <Tooltip title="Đánh dấu đã đọc">
              <IconButton
                size="small"
                onClick={handleMarkAsRead}
                sx={{
                  color: 'primary.main',
                  p: 0.75,
                  '&:hover': {
                    bgcolor: 'primary.50',
                  },
                }}
              >
                <MarkReadIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Xóa">
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{
                  color: 'text.secondary',
                  p: 0.75,
                  '&:hover': {
                    bgcolor: 'error.50',
                    color: 'error.main',
                  },
                }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}

