import { useRef, useEffect, useState, useCallback } from 'react';
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
  Fade,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
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
  onRetryMessage,
  onRemoveMessage,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const isNearBottomRef = useRef(true);

  // Check if user is near the bottom (top in reversed layout)
  const checkIfNearBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      // In reversed layout, scrollTop near 0 means at the bottom (newest messages)
      return Math.abs(scrollTop) < 100;
    }
    return true;
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesContainerRef.current) {
      if (smooth) {
        messagesContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } else {
        messagesContainerRef.current.scrollTop = 0;
      }
      setShowScrollButton(false);
      setNewMessageCount(0);
    }
  }, []);

  // Handle new messages
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;
    
    if (currentLength > prevLength) {
      // New message(s) arrived
      const isAtBottom = checkIfNearBottom();
      
      if (isAtBottom) {
        // Auto-scroll to show new message
        scrollToBottom(true);
      } else {
        // Show indicator for new messages
        setNewMessageCount(prev => prev + (currentLength - prevLength));
        setShowScrollButton(true);
      }
    }
    
    prevMessagesLengthRef.current = currentLength;
  }, [messages.length, checkIfNearBottom, scrollToBottom]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    scrollToBottom();
    setNewMessageCount(0);
    setShowScrollButton(false);
    prevMessagesLengthRef.current = messages.length;
  }, [conversation?.conversationID, scrollToBottom, messages.length]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Update isNearBottom state
    isNearBottomRef.current = Math.abs(scrollTop) < 100;
    
    // Show/hide scroll button based on position
    if (isNearBottomRef.current) {
      setShowScrollButton(false);
      setNewMessageCount(0);
    }
    
    // Load more when scrolled to bottom (which is top in reversed layout)
    const scrolledToOldMessages = Math.abs(scrollTop) + clientHeight >= scrollHeight - 10;
    if (scrolledToOldMessages && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

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
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          ref={messagesContainerRef}
          onScroll={handleScroll}
          sx={{
            height: '100%',
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
                    key={message.messageID || message.tempId}
                    message={message}
                    currentUserId={currentUserId}
                    onRetry={onRetryMessage}
                    onRemove={onRemoveMessage}
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

        {/* Scroll to bottom button */}
        <Fade in={showScrollButton}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <Chip
              icon={<KeyboardArrowDownIcon />}
              label={newMessageCount > 0 ? `${newMessageCount} tin nhắn mới` : 'Tin nhắn mới nhất'}
              color="primary"
              onClick={() => scrollToBottom(true)}
              sx={{
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                },
              }}
            />
          </Box>
        </Fade>
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
