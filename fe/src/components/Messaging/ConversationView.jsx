import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Fade,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Event as EventIcon,
  ArrowBack as ArrowBackIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Info as InfoIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import MessagesSkeleton from './MessagesSkeleton';
import QuickInfoModal from './QuickInfoModal';
import CreateAppointmentDialog from '../../components/Doctor/Appointment/CreateAppointmentDialog';
import { GET_APPOINTMENTS } from '../../graphql/doctorQueries';
import { familyAppointments } from '../../graphql/familyQueries';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * ConversationView component displays messages in a conversation with input
 * Requirements: 1.1, 1.2, 2.1, 9.1, 10.4
 */
export default function ConversationView({
  conversation,
  messages = [],
  currentUserId,
  currentUserRole = 'BacSi',
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [quickInfoOpen, setQuickInfoOpen] = useState(false);
  const [createAppointmentOpen, setCreateAppointmentOpen] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const isNearBottomRef = useRef(true);

  const familyID = conversation?.family?.familyID;

  // Query appointments for doctor
  const { data: appointmentsData, loading: appointmentsLoading, error: appointmentsError } = useQuery(
    GET_APPOINTMENTS,
    {
      skip: currentUserRole !== 'DOCTOR' || !familyID || !showAppointments,
      variables: {
        filter: {
          familyID: familyID ? parseInt(familyID) : null,
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Query family appointments for family
  const { data: familyAppointmentsData, loading: familyAppointmentsLoading, error: familyAppointmentsError } = useQuery(
    familyAppointments,
    {
      skip: currentUserRole !== 'FAMILY' || !showAppointments,
      fetchPolicy: 'cache-and-network',
    }
  );

  const loadingAppointments = currentUserRole === 'DOCTOR' ? appointmentsLoading : familyAppointmentsLoading;
  const errorAppointments = currentUserRole === 'DOCTOR' ? appointmentsError : familyAppointmentsError;
  const appointments = currentUserRole === 'DOCTOR' 
    ? appointmentsData?.appointments || []
    : familyAppointmentsData?.familyAppointments || [];

  // Filter appointments by familyID for family users
  let filteredAppointments = appointments;
  if (currentUserRole === 'FAMILY' && familyID) {
    filteredAppointments = appointments.filter(apt => 
      apt.family?.familyID === parseInt(familyID)
    );
  }

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime)
  );

  const APPOINTMENT_TYPE_LABELS = {
    GENERAL_CHECKUP: 'Khám tổng quát',
    FOLLOW_UP: 'Tái khám',
    CONSULTATION: 'Tư vấn',
    VACCINATION: 'Tiêm chủng',
    HOME_VISIT: 'Khám tại nhà',
    OTHER: 'Khác',
  };

  const APPOINTMENT_STATUS_LABELS = {
    SCHEDULED: 'Đã lên lịch',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  const STATUS_COLORS = {
    SCHEDULED: 'default',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
  };

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {onBack && (
            <IconButton onClick={onBack} sx={{ display: { sm: 'none' } }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {otherPartyName?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{otherPartyName}</Typography>
            <Typography variant="caption" color="textSecondary">
              {currentUserRole === 'DOCTOR' ? 'Gia đình bệnh nhân' : 'Bác sĩ'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton 
            onClick={() => setQuickInfoOpen(true)}
            size="small"
            title="Xem thông tin nhanh"
            sx={{ color: 'primary.main' }}
          >
            <InfoIcon />
          </IconButton>
          <IconButton 
            onClick={() => setShowAppointments(!showAppointments)}
            size="small"
            title="Xem lịch hẹn"
            sx={{ color: showAppointments ? 'primary.main' : 'text.secondary' }}
          >
            <CalendarTodayIcon />
          </IconButton>
          {currentUserRole === 'DOCTOR' && (
            <IconButton 
              onClick={() => setCreateAppointmentOpen(true)}
              size="small"
              title="Thêm lịch hẹn"
              sx={{ color: 'primary.main' }}
            >
              <EventIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Appointments Panel */}
      <Collapse in={showAppointments}>
        <Paper
          sx={{
            mx: 2,
            mt: 2,
            mb: 1,
            p: 2,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Lịch hẹn ({sortedAppointments.length})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentUserRole === 'DOCTOR' && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateAppointmentOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Thêm lịch hẹn
                </Button>
              )}
              <IconButton
                size="small"
                onClick={() => setShowAppointments(false)}
              >
                <ExpandLessIcon />
              </IconButton>
            </Box>
          </Box>

          {loadingAppointments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : errorAppointments ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Không thể tải danh sách lịch hẹn: {errorAppointments.message}
            </Alert>
          ) : sortedAppointments.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary">Chưa có lịch hẹn nào</Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {sortedAppointments.slice(0, 5).map((appointment, index) => (
                <Box key={appointment.appointmentID}>
                  <Box
                    sx={{
                      p: 1.5,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          {appointment.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                          <Chip
                            label={APPOINTMENT_STATUS_LABELS[appointment.status] || appointment.status}
                            size="small"
                            color={STATUS_COLORS[appointment.status] || 'default'}
                          />
                          {appointment.type && (
                            <Chip
                              label={APPOINTMENT_TYPE_LABELS[appointment.type] || appointment.type}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" display="block">
                      {format(new Date(appointment.appointmentDateTime), "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                    </Typography>
                    {currentUserRole === 'DOCTOR' && appointment.member && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Bệnh nhân: {appointment.member.fullName}
                      </Typography>
                    )}
                    {currentUserRole === 'FAMILY' && appointment.doctor && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Bác sĩ: {appointment.doctor.fullName}
                      </Typography>
                    )}
                  </Box>
                  {index < Math.min(sortedAppointments.length, 5) - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Collapse>

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
          <MessagesSkeleton />
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
              <Box sx={{ mt: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <MessagesSkeleton />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button size="small" onClick={onLoadMore}>
                      Tải thêm tin nhắn
                    </Button>
                  </Box>
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

      {/* Modals */}
      <QuickInfoModal
        open={quickInfoOpen}
        onClose={() => setQuickInfoOpen(false)}
        conversation={conversation}
        currentUserRole={currentUserRole}
      />
      
      {currentUserRole === 'DOCTOR' && (
        <CreateAppointmentDialog
          open={createAppointmentOpen}
          onClose={() => setCreateAppointmentOpen(false)}
          conversation={conversation}
          onAppointmentCreated={(appointment) => {
            console.log('Appointment created:', appointment);
            // Optionally refresh appointments or show notification
          }}
        />
      )}
    </Box>
  );
}
