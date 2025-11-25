import { Box, Typography, Avatar, Link } from '@mui/material';
import { InsertDriveFile as FileIcon } from '@mui/icons-material';
import { formatMessageTime, formatFileSize } from '../../utils/timeFormat';

/**
 * MessageBubble component displays a single message with sender info, content, timestamp, and attachments
 * Requirements: 1.1, 1.2, 9.3
 */
export default function MessageBubble({ message, currentUserId }) {
  const isOwnMessage = message.sender.userID === currentUserId;
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2.5,
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
          {message.sender.fullName?.charAt(0) || 'U'}
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
            {message.sender.fullName}
          </Typography>
        )}
        
        {/* Message content */}
        <Box
          sx={{
            p: 2,
            bgcolor: isOwnMessage ? 'primary.main' : 'white',
            color: isOwnMessage ? 'white' : 'text.primary',
            borderRadius: 3,
            borderTopRightRadius: isOwnMessage ? 4 : 16,
            borderTopLeftRadius: isOwnMessage ? 16 : 4,
            border: 1,
            borderColor: isOwnMessage ? 'primary.dark' : 'grey.200',
            boxShadow: isOwnMessage 
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
        
        {/* Timestamp and read status */}
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: 'block',
            mt: 0.5,
            px: 1,
            textAlign: isOwnMessage ? 'right' : 'left',
          }}
        >
          {formatMessageTime(message.createdAt)}
          {isOwnMessage && message.isRead && ' • Đã xem'}
        </Typography>
      </Box>
      
      {isOwnMessage && (
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36, 
            ml: 1.5, 
            bgcolor: 'primary.main', 
            fontSize: '0.9rem' 
          }}
        >
          {message.sender.fullName?.charAt(0) || 'U'}
        </Avatar>
      )}
    </Box>
  );
}
