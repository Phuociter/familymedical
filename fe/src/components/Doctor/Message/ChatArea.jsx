import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import MessagesSkeleton from './MessagesSkeleton';

function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: message.isFromDoctor ? 'flex-end' : 'flex-start',
        mb: 2.5,
      }}
    >
      {!message.isFromDoctor && (
        <Avatar sx={{ width: 36, height: 36, mr: 1.5, bgcolor: 'grey.400', fontSize: '0.9rem' }}>
          {message.senderName.charAt(0)}
        </Avatar>
      )}
      <Box sx={{ maxWidth: '65%' }}>
        <Box
          sx={{
            p: 2,
            bgcolor: message.isFromDoctor ? 'primary.main' : 'white',
            color: message.isFromDoctor ? 'white' : 'text.primary',
            borderRadius: 3,
            borderTopRightRadius: message.isFromDoctor ? 4 : 16,
            borderTopLeftRadius: message.isFromDoctor ? 16 : 4,
            border: 1,
            borderColor: message.isFromDoctor ? 'primary.dark' : 'grey.200',
            boxShadow: message.isFromDoctor 
              ? '0 2px 8px rgba(25, 118, 210, 0.25)' 
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {message.content}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: 'block',
            mt: 0.5,
            px: 1,
            textAlign: message.isFromDoctor ? 'right' : 'left',
          }}
        >
          {formatMessageTime(message.timestamp)}
        </Typography>
      </Box>
      {message.isFromDoctor && (
        <Avatar sx={{ width: 36, height: 36, ml: 1.5, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
          BS
        </Avatar>
      )}
    </Box>
  );
}

const QUICK_REPLIES = [
  'Cảm ơn bạn đã liên hệ',
  'Tôi sẽ kiểm tra và phản hồi sớm',
  'Vui lòng uống thuốc đúng giờ',
  'Hãy theo dõi triệu chứng và báo lại cho tôi',
  'Nếu có triệu chứng bất thường, hãy đến bệnh viện ngay',
];

export default function ChatArea({ conversation, messages = [], onSendMessage, loading = false }) {
  const [messageText, setMessageText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [quickReplyAnchor, setQuickReplyAnchor] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleQuickReplyOpen = (event) => {
    setQuickReplyAnchor(event.currentTarget);
  };

  const handleQuickReplyClose = () => {
    setQuickReplyAnchor(null);
  };

  const handleQuickReply = (reply) => {
    setMessageText(reply);
    handleQuickReplyClose();
  };

  if (!conversation) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
        }}
      >
        <Typography color="textSecondary">
          Chọn một cuộc trò chuyện để bắt đầu
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 80,
          boxSizing: 'border-box',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {conversation.familyName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{conversation.familyName}</Typography>
            <Typography variant="caption" color="textSecondary">
              {conversation.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Menu Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem hồ sơ gia đình</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EventIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đặt lịch hẹn</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem hồ sơ bệnh án</ListItemText>
        </MenuItem>
      </Menu>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflow: 'auto',
          bgcolor: 'grey.50',
        }}
      >
        {loading ? (
          <MessagesSkeleton />
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography color="textSecondary">
              Chưa có tin nhắn nào
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'white',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <IconButton 
            sx={{ 
              bgcolor: 'grey.100',
              borderRadius: '12px',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'grey.200',
              }
            }}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={handleQuickReplyOpen}
            sx={{ 
              bgcolor: 'warning.light',
              color: 'warning.dark',
              borderRadius: '12px',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'warning.main',
                color: 'white',
              }
            }}
          >
            <BoltIcon fontSize="small" />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Nhập tin nhắn..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!messageText.trim()}
            sx={{ 
              bgcolor: messageText.trim() ? 'primary.main' : 'grey.100',
              color: messageText.trim() ? 'white' : 'grey.400',
              borderRadius: '12px',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: messageText.trim() ? 'primary.dark' : 'grey.200',
              },
              '&:disabled': {
                bgcolor: 'grey.100',
                color: 'grey.400',
              }
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Quick Replies Menu */}
        <Menu
          anchorEl={quickReplyAnchor}
          open={Boolean(quickReplyAnchor)}
          onClose={handleQuickReplyClose}
        >
          {QUICK_REPLIES.map((reply, index) => (
            <MenuItem key={index} onClick={() => handleQuickReply(reply)}>
              {reply}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
}
