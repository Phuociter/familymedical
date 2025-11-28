import { Badge } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

/**
 * NotificationBadge component
 * Displays a badge with unread notification count
 */
export default function NotificationBadge({ unreadCount, onClick }) {
  return (
    <Badge
      badgeContent={unreadCount > 0 ? unreadCount : null}
      color="error"
      overlap="circular"
      onClick={onClick}
      sx={{ cursor: 'pointer' }}
    >
      <NotificationsIcon sx={{ color: 'text.primary' }} />
    </Badge>
  );
}

