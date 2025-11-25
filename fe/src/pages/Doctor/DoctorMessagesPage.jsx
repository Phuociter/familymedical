import { useState, useEffect } from 'react';
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

/**
 * DoctorMessagesPage - Main messaging interface for doctors
 * Integrates with GraphQL backend for realtime messaging
 * Requirements: 1.1, 1.2, 2.1, 2.3, 2.4, 9.1, 10.4
 */
export default function DoctorMessagesPage() {
  const currentUser = useSelector((state) => state.user.user);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Conversations, 1: Families

  // Fetch assigned families
  const { data: familiesData, loading: familiesLoading } = useQuery(GET_ASSIGNED_FAMILIES, {
    variables: { search: null },
    skip: !currentUser,
  });

  // TODO: Replace with GraphQL queries and subscriptions
  // For now, using empty state - will be integrated in task 16
  useEffect(() => {
    // This will be replaced with:
    // const { data, loading } = useQuery(MY_CONVERSATIONS_QUERY);
    // const { data: subscriptionData } = useSubscription(MESSAGE_RECEIVED_SUBSCRIPTION);
    // const { data: typingData } = useSubscription(TYPING_INDICATOR_SUBSCRIPTION);
    
    setConversationsLoading(false);
  }, []);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setMessagesLoading(true);
    
    try {
      // TODO: Replace with GraphQL query
      // const { data } = await client.query({
      //   query: CONVERSATION_MESSAGES_QUERY,
      //   variables: { conversationID: conversation.conversationID, page: 0, size: 50 }
      // });
      // setMessages(data.conversationMessages.messages);
      
      // Mark conversation as read
      // await markConversationAsReadMutation({
      //   variables: { conversationID: conversation.conversationID }
      // });
      
      setMessages([]);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (text, attachments) => {
    if (!selectedConversation || (!text.trim() && attachments.length === 0)) {
      return;
    }

    setSending(true);
    try {
      // TODO: Replace with GraphQL mutation
      // const { data } = await sendMessageMutation({
      //   variables: {
      //     input: {
      //       conversationID: selectedConversation.conversationID,
      //       recipientID: selectedConversation.family.familyID,
      //       content: text,
      //       attachments: attachments
      //     }
      //   }
      // });
      
      // Optimistically add message to UI
      // setMessages(prev => [...prev, data.sendMessage]);
      
      console.log('Sending message:', { text, attachments });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  const handleTypingStart = () => {
    if (!selectedConversation) return;
    
    // TODO: Replace with GraphQL mutation
    // sendTypingIndicatorMutation({
    //   variables: {
    //     input: {
    //       conversationID: selectedConversation.conversationID,
    //       isTyping: true
    //     }
    //   }
    // });
  };

  const handleTypingStop = () => {
    if (!selectedConversation) return;
    
    // TODO: Replace with GraphQL mutation
    // sendTypingIndicatorMutation({
    //   variables: {
    //     input: {
    //       conversationID: selectedConversation.conversationID,
    //       isTyping: false
    //     }
    //   }
    // });
  };

  const handleLoadMore = async () => {
    // TODO: Implement pagination
    // Load more messages when scrolling to top
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
    // TODO: Find or create conversation with this family
    // For now, create a mock conversation object
    const mockConversation = {
      conversationID: `temp-${family.familyID}`,
      family: family,
      doctor: currentUser,
      lastMessageAt: null,
      unreadCount: 0,
    };
    setSelectedConversation(mockConversation);
    setMessages([]);
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
                    primary={
                      <Typography variant="subtitle2" noWrap>
                        {family.familyName}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          Chủ hộ: {family.headOfFamily?.fullName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {family.members?.length || 0} thành viên
                        </Typography>
                      </Box>
                    }
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
