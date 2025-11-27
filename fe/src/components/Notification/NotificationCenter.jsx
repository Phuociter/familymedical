import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

/**
 * Navigate to related entity based on notification type
 */
const navigateToEntity = (notification, navigate) => {
  const { type, relatedEntityType, relatedEntityID } = notification;

  switch (type) {
    case 'APPOINTMENT_CREATED':
    case 'APPOINTMENT_UPDATED':
    case 'APPOINTMENT_CANCELLED':
      navigate(`/doctor/appointments${relatedEntityID ? `/${relatedEntityID}` : ''}`);
      break;
    case 'DOCTOR_REQUEST_CREATED':
    case 'DOCTOR_REQUEST_ACCEPTED':
    case 'DOCTOR_REQUEST_REJECTED':
      navigate('/doctor/requests');
      break;
    case 'MEDICAL_RECORD_CREATED':
    case 'MEDICAL_RECORD_UPDATED':
      // Navigate to families page - user can find the record from there
      navigate('/doctor/families');
      break;
    default:
      break;
  }
};

/**
 * NotificationCenter component
 * Displays notification dropdown with list of notifications
 */
export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const listRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications(0, 20);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    // Refetch when opening
    refetch();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    navigateToEntity(notification, navigate);
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      // Load more logic is handled by useNotifications hook
      refetch();
    }
  };

  // Scroll to top when opening
  useEffect(() => {
    if (anchorEl && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [anchorEl]);

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton onClick={handleOpen} sx={{ ml: 1 }}>
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : null}
            color="error"
            overlap="circular"
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 560,
            mt: 1,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            p: 2,
            color: 'white',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: unreadCount > 0 ? 1.5 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ position: 'relative' }}>
                <NotificationsIcon sx={{ fontSize: 20 }} />
                {unreadCount > 0 && (
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  />
                )}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Thông báo
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.5,
                fontSize: '0.8125rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
              }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        <Box
          ref={listRef}
          sx={{
            maxHeight: 460,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#ccc',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#999',
            },
          }}
        >
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={20} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <NotificationsIcon
                sx={{
                  fontSize: 48,
                  color: 'text.disabled',
                  mb: 1.5,
                  opacity: 0.3,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Không có thông báo mới
              </Typography>
            </Box>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.notificationID}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClick={handleNotificationClick}
                />
              ))}
              {/* Load More Button */}
              {hasMore && (
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Button
                    fullWidth
                    onClick={handleLoadMore}
                    disabled={loading}
                    size="small"
                    sx={{
                      py: 1,
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={14} /> : 'Tải thêm'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Popover>
    </>
  );
}

