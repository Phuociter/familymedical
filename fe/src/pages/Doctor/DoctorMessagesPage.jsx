import { useState } from 'react';
import { Paper } from '@mui/material';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../../mocks/messagesMockData';
import ConversationList from '../../components/Doctor/Message/ConversationList';
import ChatArea from '../../components/Doctor/Message/ChatArea';

export default function DoctorMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  };

  const handleSendMessage = (content) => {
    if (!selectedConversation || !content.trim()) return;

    const newMessage = {
      id: Date.now(),
      conversationId: selectedConversation.id,
      senderId: 'DOCTOR',
      senderName: 'Bác sĩ',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isFromDoctor: true,
    };

    // Add message to conversation
    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] || []),
        newMessage,
      ],
    }));

    // Update last message in conversation list
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              lastMessage: content.trim(),
              lastMessageTime: new Date().toISOString(),
            }
          : conv
      )
    );
  };

  const currentMessages = selectedConversation 
    ? messages[selectedConversation.id] || []
    : [];

  return (
    <Paper 
      elevation={0}
      sx={{ 
        height: 'calc(100vh - 120px)', 
        display: 'flex',
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
      />

      <ChatArea
        conversation={selectedConversation}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
      />
    </Paper>
  );
}
