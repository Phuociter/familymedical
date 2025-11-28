import { Box, Typography, Avatar, Link, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { 
  InsertDriveFile as FileIcon,
  Schedule as PendingIcon,
  Done as SentIcon,
  DoneAll as DeliveredIcon,
  Error as ErrorIcon,
  Refresh as RetryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { formatMessageTime, formatFileSize } from '../../utils/timeFormat';
import { MESSAGE_STATUS } from '../../hooks/useSendMessage';

/**
 * MessageBubble component displays a single message with sender info, content, timestamp, attachments and status
 * Requirements: 1.1, 1.2, 9.3
 */
export default function MessageBubble({ 
  message, 
  currentUserId,
  onRetry,
  onRemove,
}) {
  const isOwnMessage = message.sender?.userID === currentUserId;
  const isPending = message.status === MESSAGE_STATUS?.PENDING;
  const isFailed = message.status === MESSAGE_STATUS?.FAILED;
  const isSent = message.status === MESSAGE_STATUS?.SENT;

  // Render status icon for own messages
  const renderStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (isPending) {
      return (
        <Tooltip title="Đang gửi...">
          <CircularProgress size={12} sx={{ ml: 0.5, color: 'grey.400' }} />
        </Tooltip>
      );
    }

    if (isFailed) {
      return (
        <Tooltip title="Gửi thất bại">
          <ErrorIcon sx={{ fontSize: 14, ml: 0.5, color: 'error.main' }} />
        </Tooltip>
      );
    }

    if (message.isRead) {
      return (
        <Tooltip title="Đã xem">
          <DoneAll sx={{ fontSize: 14, ml: 0.5, color: 'primary.main' }} />
        </Tooltip>
      );
    }

    if (isSent || message.messageID) {
      return (
        <Tooltip title="Đã gửi">
          <SentIcon sx={{ fontSize: 14, ml: 0.5, color: 'grey.400' }} />
        </Tooltip>
      );
    }

    return null;
  };

  // Import DoneAll icon
  const DoneAll = DeliveredIcon;
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2.5,
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {!isOwnMessage && (
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36, 
            mr: 1.5, 
            bgcolor: 'grey.400', 
            fontSize: '0.9rem' 
          }}
        >
          {message.sender?.fullName?.charAt(0) || 'U'}
        </Avatar>
      )}
      
      <Box sx={{ maxWidth: '65%' }}>
        {/* Sender name for received messages */}
        {!isOwnMessage && (
          <Typography 
            variant="caption" 
            color="textSecondary"
            sx={{ display: 'block', mb: 0.5, px: 1 }}
          >
            {message.sender?.fullName}
          </Typography>
        )}
        
        {/* Message content */}
        <Box
          sx={{
            p: 2,
            bgcolor: isFailed 
              ? 'error.lighter' 
              : isOwnMessage 
                ? 'primary.main' 
                : 'white',
            color: isFailed 
              ? 'error.dark'
              : isOwnMessage 
                ? 'white' 
                : 'text.primary',
            borderRadius: 3,
            borderTopRightRadius: isOwnMessage ? 4 : 16,
            borderTopLeftRadius: isOwnMessage ? 16 : 4,
            border: 1,
            borderColor: isFailed 
              ? 'error.main'
              : isOwnMessage 
                ? 'primary.dark' 
                : 'grey.200',
            boxShadow: isFailed
              ? '0 2px 8px rgba(211, 47, 47, 0.25)'
              : isOwnMessage 
                ? '0 2px 8px rgba(25, 118, 210, 0.25)' 
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </Typography>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              {message.attachments.map((attachment) => (
                <Link
                  key={attachment.attachmentID}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    mt: 0.5,
                    bgcolor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'grey.100',
                    borderRadius: 1,
                    textDecoration: 'none',
                    color: isOwnMessage ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: isOwnMessage ? 'rgba(255,255,255,0.3)' : 'grey.200',
                    },
                  }}
                >
                  <FileIcon fontSize="small" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {attachment.filename}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {formatFileSize(attachment.fileSize)}
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Box>
          )}
        </Box>
        
        {/* Failed message actions */}
        {isFailed && isOwnMessage && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'flex-end' }}>
            {onRetry && (
              <Tooltip title="Thử lại">
                <IconButton 
                  size="small" 
                  onClick={() => onRetry(message.tempId)}
                  sx={{ 
                    color: isFailed ? 'error.dark' : 'white',
                    p: 0.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <RetryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onRemove && (
              <Tooltip title="Xóa">
                <IconButton 
                  size="small" 
                  onClick={() => onRemove(message.tempId)}
                  sx={{ 
                    color: isFailed ? 'error.dark' : 'white',
                    p: 0.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        {/* Timestamp and status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            mt: 0.5,
            px: 1,
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ fontSize: '0.7rem' }}
          >
            {isFailed ? 'Gửi thất bại' : formatMessageTime(message.createdAt)}
          </Typography>
          {renderStatusIcon()}
        </Box>
      </Box>
    </Box>
  );
}
