import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { ConversationList, ConversationView } from '../../components/Messaging';
import { useSendMessage, useMarkConversationAsRead } from '../../hooks/useSendMessage';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';

/**
 * FamilyMessagesPage - Main messaging interface for families
 * Integrates with GraphQL backend for realtime messaging
 */
export default function FamilyMessagesPage() {
  const currentUser = useSelector((state) => state.user.user);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

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

  // Mark conversation as read hook
  const { markConversationAsRead } = useMarkConversationAsRead();

  // Handle selecting a conversation
  const handleSelectConversation = useCallback(async (conversation) => {
    setSelectedConversation(conversation);
  }, []);

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

  const handleSendMessage = useCallback(async (text, attachments) => {
    if (!selectedConversation || (!text.trim() && attachments.length === 0)) {
      return;
    }

    // For family, recipient is the doctor
    const recipientID = selectedConversation.doctor?.userID;

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

    const recipientID = selectedConversation.doctor?.userID;
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

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Left sidebar - Conversations */}
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
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          loading={conversationsLoading}
          currentUserRole="FAMILY"
          hideHeader={false}
        />
      </Box>

      {/* Right side - Conversation view */}
      <ConversationView
        conversation={selectedConversation}
        messages={messages}
        currentUserId={currentUser?.userID}
        currentUserRole="FAMILY"
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
