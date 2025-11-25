import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { formatConversationTime } from '../../utils/timeFormat';

/**
 * ConversationList component displays all conversations with search and unread badges
 * Requirements: 2.1, 2.3, 2.4
 */
export default function ConversationList({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  loading = false,
  currentUserRole = 'DOCTOR', // 'DOCTOR' or 'FAMILY'
  hideHeader = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const otherPartyName = currentUserRole === 'DOCTOR' 
      ? conv.family?.familyName 
      : conv.doctor?.fullName;
    
    return otherPartyName?.toLowerCase().includes(searchLower);
  });

  // Sort conversations by last message time (most recent first)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return timeB - timeA;
  });

  const getOtherParty = (conversation) => {
    return currentUserRole === 'DOCTOR' ? conversation.family : conversation.doctor;
  };

  const getOtherPartyName = (conversation) => {
    const otherParty = getOtherParty(conversation);
    return currentUserRole === 'DOCTOR' 
      ? otherParty?.familyName 
      : otherParty?.fullName;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'Chưa có tin nhắn';
    
    const message = conversation.lastMessage;
    const prefix = message.sender.userID === (currentUserRole === 'DOCTOR' ? conversation.doctor.userID : conversation.family.familyID)
      ? 'Bạn: '
      : '';
    
    if (message.attachments && message.attachments.length > 0) {
      return `${prefix}📎 ${message.attachments.length} file đính kèm`;
    }
    
    return prefix + message.content;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Search header */}
      {!hideHeader && (
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            height: 80,
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            zIndex: 10,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm cuộc trò chuyện..."
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
      )}
      
      {hideHeader && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm cuộc trò chuyện..."
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
      )}

      {/* Conversations list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : sortedConversations.length === 0 ? (
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
              {searchTerm ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sortedConversations.map((conversation) => {
              const otherPartyName = getOtherPartyName(conversation);
              const isSelected = selectedConversation?.conversationID === conversation.conversationID;
              
              return (
                <ListItem key={conversation.conversationID} disablePadding>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => onSelectConversation(conversation)}
                    sx={{
                      py: 1.5,
                      bgcolor: isSelected ? 'primary.50' : 'transparent',
                      borderLeft: isSelected ? 3 : 0,
                      borderColor: 'primary.main',
                      '&.Mui-selected': {
                        bgcolor: 'primary.50',
                        '&:hover': {
                          bgcolor: 'primary.100',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {otherPartyName?.charAt(0) || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            noWrap
                            sx={{
                              flex: 1,
                              pr: 1,
                              fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                            }}
                          >
                            {otherPartyName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatConversationTime(conversation.lastMessageAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{
                              flex: 1,
                              pr: 1,
                              fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                            }}
                          >
                            {getLastMessagePreview(conversation)}
                          </Typography>
                          {conversation.unreadCount > 0 && (
                            <Badge
                              badgeContent={conversation.unreadCount}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  position: 'static',
                                  transform: 'none',
                                  minWidth: 20,
                                  height: 20,
                                  fontSize: '0.75rem',
                                },
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}
