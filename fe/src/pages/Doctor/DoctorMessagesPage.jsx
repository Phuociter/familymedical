import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import { ConversationList, ConversationView } from '../../components/Messaging';
import { GET_ASSIGNED_FAMILIES } from '../../graphql/doctorQueries';
import { useSendMessage, useMarkConversationAsRead } from '../../hooks/useSendMessage';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';

/**
 * DoctorMessagesPage - Main messaging interface for doctors
 * Integrates with GraphQL backend for realtime messaging
 * Requirements: 1.1, 1.2, 2.1, 2.3, 2.4, 9.1, 10.4
 */
export default function DoctorMessagesPage() {
  const currentUser = useSelector((state) => state.user.user);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Conversations, 1: Families

  // Fetch assigned families
  const { data: familiesData, loading: familiesLoading } = useQuery(GET_ASSIGNED_FAMILIES, {
    variables: { search: null },
    skip: !currentUser,
  });

  // Fetch conversations - pass selectedConversationID to avoid unread count increase for current conversation
  const { 
    conversations, 
    loading: conversationsLoading,
    markConversationAsReadLocal 
  } = useConversations({ 
    selectedConversationID: selectedConversation?.conversationID 
  });

  // Fetch messages for selected conversation
  const { 
    messages, 
    loading: messagesLoading,
    loadMore: handleLoadMore,
    addOptimisticMessage,
    updateMessageStatus,
    removeMessage,
  } = useMessages(selectedConversation?.conversationID);

  // Send message hook with optimistic updates
  const { sendMessage, loading: sending } = useSendMessage({
    currentUser,
    onCompleted: (message) => {
      console.log('Message sent successfully:', message);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  // Mark conversation as read hook - must be declared before useEffect that uses it
  const { markConversationAsRead } = useMarkConversationAsRead();

  // Auto mark as read when viewing conversation
  const markAsReadTimeoutRef = useRef(null);
  
  useEffect(() => {
    // Clear previous timeout
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }

    // Auto mark as read after 1 second of viewing
    if (selectedConversation?.conversationID && selectedConversation.unreadCount > 0) {
      markAsReadTimeoutRef.current = setTimeout(async () => {
        try {
          markConversationAsReadLocal(selectedConversation.conversationID);
          await markConversationAsRead(parseInt(selectedConversation.conversationID));
        } catch (error) {
          console.error('Auto mark as read failed:', error);
        }
      }, 1000);
    }

    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [selectedConversation?.conversationID, selectedConversation?.unreadCount, markConversationAsRead, markConversationAsReadLocal]);

  // Handle selecting a conversation and mark as read
  const handleSelectConversation = useCallback(async (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read when selecting
    if (conversation?.conversationID && conversation.unreadCount > 0) {
      try {
        // Update local state immediately for better UX
        markConversationAsReadLocal(conversation.conversationID);
        // Then sync with server
        await markConversationAsRead(parseInt(conversation.conversationID));
        console.log('Marked conversation as read:', conversation.conversationID);
      } catch (error) {
        console.error('Failed to mark conversation as read:', error);
      }
    }
  }, [markConversationAsRead, markConversationAsReadLocal]);

  const handleSendMessage = useCallback(async (text, attachments) => {
    if (!selectedConversation || (!text.trim() && attachments.length === 0)) {
      return;
    }

    // Determine recipient ID based on conversation
    const recipientID = 
      selectedConversation.family?.headOfFamilyID || 
      selectedConversation.family?.headOfFamily?.userID;

    if (!recipientID) {
      console.error('Cannot determine recipient ID from conversation:', selectedConversation);
      alert('Không thể xác định người nhận. Vui lòng thử lại.');
      return;
    }

    try {
      await sendMessage({
        conversationID: selectedConversation.conversationID ? parseInt(selectedConversation.conversationID) : null,
        recipientID: parseInt(recipientID),
        content: text,
        attachments: attachments || [],
        // Optimistic update callbacks
        onOptimisticUpdate: addOptimisticMessage,
        onStatusUpdate: updateMessageStatus,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Error is already handled in useSendMessage with status update
    }
  }, [selectedConversation, sendMessage, addOptimisticMessage, updateMessageStatus]);

  // Handle retry failed message
  const handleRetryMessage = useCallback(async (tempId) => {
    const failedMessage = messages.find(m => m.tempId === tempId);
    if (!failedMessage) return;

    const recipientID = 
      selectedConversation.family?.headOfFamilyID || 
      selectedConversation.family?.headOfFamily?.userID;

    if (!recipientID) return;

    try {
      await sendMessage({
        conversationID: selectedConversation.conversationID ? parseInt(selectedConversation.conversationID) : null,
        recipientID: parseInt(recipientID),
        content: failedMessage.content,
        attachments: [],
        onOptimisticUpdate: null, // Don't add duplicate
        onStatusUpdate: updateMessageStatus,
      });
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }, [selectedConversation, messages, sendMessage, updateMessageStatus]);

  // Handle remove failed message
  const handleRemoveMessage = useCallback((tempId) => {
    removeMessage(tempId);
  }, [removeMessage]);

  const handleTypingStart = () => {
    if (!selectedConversation) return;
    // TODO: Implement typing indicator in future task
  };

  const handleTypingStop = () => {
    if (!selectedConversation) return;
    // TODO: Implement typing indicator in future task
  };

  if (!currentUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 120px)',
        }}
      >
        <Typography color="textSecondary">
          Vui lòng đăng nhập để sử dụng tính năng tin nhắn
        </Typography>
      </Box>
    );
  }

  const handleFamilySelect = (family) => {
    // Find existing conversation or create new one
    const existingConversation = conversations.find(
      conv => conv.family?.familyID === family.familyID
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      // Create a temporary conversation object for new conversations
      const newConversation = {
        conversationID: null, // Will be created on first message
        family: family,
        doctor: currentUser,
        lastMessageAt: null,
        unreadCount: 0,
      };
      setSelectedConversation(newConversation);
    }
    
    setActiveTab(0); // Switch back to conversations tab
  };

  const assignedFamilies = familiesData?.getDoctorAssignedFamilies || [];

  return (
    <Paper
      elevation={0}
      sx={{
        height: 'calc(100vh - 120px)',
        display: 'flex',
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Left sidebar with tabs */}
      <Box
        sx={{
          width: 360,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
        }}
      >
        {/* Tabs header */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'white',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab label="Cuộc trò chuyện" />
            <Tab label="Gia đình" />
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 0 ? (
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              loading={conversationsLoading}
              currentUserRole="DOCTOR"
              hideHeader={true}
            />
          ) : (
            <FamilyList
              families={assignedFamilies}
              onSelectFamily={handleFamilySelect}
              loading={familiesLoading}
            />
          )}
        </Box>
      </Box>

      <ConversationView
        conversation={selectedConversation}
        messages={messages}
        currentUserId={currentUser?.userID}
        currentUserRole="DOCTOR"
        loading={messagesLoading}
        sending={sending}
        typingUser={typingUser}
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        onLoadMore={handleLoadMore}
        onRetryMessage={handleRetryMessage}
        onRemoveMessage={handleRemoveMessage}
      />
    </Paper>
  );
}

// FamilyList component for displaying assigned families
function FamilyList({ families, onSelectFamily, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFamilies = families.filter((family) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      family.familyName?.toLowerCase().includes(searchLower) ||
      family.headOfFamily?.fullName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm gia đình..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
        />
      </Box>

      {/* Family list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredFamilies.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3,
              textAlign: 'center',
            }}
          >
            <Typography color="textSecondary">
              {searchTerm ? 'Không tìm thấy gia đình' : 'Chưa có gia đình nào được gán'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredFamilies.map((family) => (
              <ListItem key={family.familyID} disablePadding>
                <ListItemButton
                  onClick={() => onSelectFamily(family)}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'primary.50',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {family.familyName?.charAt(0) || 'F'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={family.familyName}
                    secondary={
                      <>
                        Chủ hộ: {family.headOfFamily?.fullName}
                        {' • '}
                        {family.members?.length || 0} thành viên
                      </>
                    }
                    primaryTypographyProps={{
                      variant: 'subtitle2',
                      noWrap: true,
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      color: 'textSecondary',
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
