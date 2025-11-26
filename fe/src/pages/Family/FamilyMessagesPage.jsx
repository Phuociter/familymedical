import { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { ConversationList, ConversationView } from '../../components/Messaging';
import { useSendMessage } from '../../hooks/useSendMessage';
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

  // Fetch conversations
  const { conversations, loading: conversationsLoading } = useConversations();

  // Fetch messages for selected conversation
  const { 
    messages, 
    loading: messagesLoading,
    loadMore: handleLoadMore 
  } = useMessages(selectedConversation?.conversationID);

  // Send message hook
  const { sendMessage, loading: sending } = useSendMessage({
    onCompleted: (message) => {
      console.log('Message sent successfully:', message);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async (text, attachments) => {
    if (!selectedConversation || (!text.trim() && attachments.length === 0)) {
      return;
    }

    try {
      // For family, recipient is the doctor
      const recipientID = selectedConversation.doctor?.userID;

      if (!recipientID) {
        console.error('Cannot determine recipient ID from conversation:', selectedConversation);
        alert('Không thể xác định người nhận. Vui lòng thử lại.');
        return;
      }

      console.log('Sending message to doctor:', recipientID);

      await sendMessage({
        conversationID: selectedConversation.conversationID ? parseInt(selectedConversation.conversationID) : null,
        recipientID: parseInt(recipientID),
        content: text,
        attachments: attachments || [],
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn: ' + (error.message || 'Lỗi không xác định'));
      throw error;
    }
  };

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
      />
    </Paper>
  );
}
