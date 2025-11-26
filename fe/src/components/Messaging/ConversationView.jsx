import { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

/**
 * ConversationView component displays messages in a conversation with input
 * Requirements: 1.1, 1.2, 2.1, 9.1, 10.4
 */
export default function ConversationView({
  conversation,
  messages = [],
  currentUserId,
  currentUserRole = 'DOCTOR',
  loading = false,
  hasMore = false,
  sending = false,
  typingUser = null,
  onSendMessage,
  onLoadMore,
  onTypingStart,
  onTypingStop,
  onBack,
  onViewProfile,
  onCreateAppointment,
  onViewMedicalRecords,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Load more when scrolled to bottom (which is top in reversed layout)
    const scrolledToBottom = Math.abs(scrollTop) + clientHeight >= scrollHeight - 10;
    if (scrolledToBottom && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
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

  const otherParty = currentUserRole === 'DOCTOR' ? conversation.family : conversation.doctor;
  const otherPartyName = currentUserRole === 'DOCTOR' 
    ? otherParty?.familyName 
    : otherParty?.fullName;

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
          {onBack && (
            <IconButton onClick={onBack} sx={{ display: { sm: 'none' } }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {otherPartyName?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="h6">{otherPartyName}</Typography>
            <Typography variant="caption" color="textSecondary">
              {currentUserRole === 'DOCTOR' ? 'Gia đình bệnh nhân' : 'Bác sĩ'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Menu Actions */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {onViewProfile && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onViewProfile(otherParty);
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {currentUserRole === 'DOCTOR' ? 'Xem hồ sơ gia đình' : 'Xem hồ sơ bác sĩ'}
            </ListItemText>
          </MenuItem>
        )}
        {onCreateAppointment && currentUserRole === 'DOCTOR' && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onCreateAppointment(otherParty);
            }}
          >
            <ListItemIcon>
              <EventIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Đặt lịch hẹn</ListItemText>
          </MenuItem>
        )}
        {onViewMedicalRecords && currentUserRole === 'DOCTOR' && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onViewMedicalRecords(otherParty);
            }}
          >
            <ListItemIcon>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xem hồ sơ bệnh án</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Messages Area */}
      <Box
        ref={messagesContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          p: 2,
          overflow: 'auto',
          bgcolor: 'grey.50',
          display: 'flex',
          flexDirection: 'column-reverse',
        }}
      >
        {loading && messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Messages - reversed order */}
            {messages.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography color="textSecondary">
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <div ref={messagesEndRef} />
                
                {/* Typing indicator */}
                {typingUser && (
                  <TypingIndicator userName={typingUser.fullName || typingUser.familyName} />
                )}
                
                {[...messages].reverse().map((message) => (
                  <MessageBubble
                    key={message.messageID}
                    message={message}
                    currentUserId={currentUserId}
                  />
                ))}
              </Box>
            )}

            {/* Load more indicator */}
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Button size="small" onClick={onLoadMore}>
                    Tải thêm tin nhắn
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        disabled={!conversation}
        sending={sending}
      />
    </Box>
  );
}
