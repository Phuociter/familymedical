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
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { useState } from 'react';

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes} phút trước`;
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Hôm qua';
  } else {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }
}

export default function ConversationList({
  conversations = [],
  selectedConversation,
  onSelectConversation,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.familyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: 360,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
        />
      </Box>

      <List sx={{ p: 0, overflow: 'auto', flex: 1 }}>
        {filteredConversations.map((conversation) => (
          <ListItem key={conversation.id} disablePadding>
            <ListItemButton
              selected={selectedConversation?.id === conversation.id}
              onClick={() => onSelectConversation(conversation)}
              sx={{ 
                py: 1.5,
                bgcolor: selectedConversation?.id === conversation.id ? 'primary.50' : 'transparent',
                borderLeft: selectedConversation?.id === conversation.id ? 3 : 0,
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
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: conversation.isOnline ? '#44b700' : 'transparent',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: '2px solid white',
                    },
                  }}
                >
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {conversation.familyName.charAt(0)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" component="span" noWrap sx={{ flex: 1, pr: 1 }}>
                      {conversation.familyName}
                    </Typography>
                    <Typography variant="caption" component="span" color="textSecondary">
                      {formatTime(conversation.lastMessageTime)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      component="span"
                      color="textSecondary"
                      noWrap
                      sx={{ flex: 1, pr: 1 }}
                    >
                      {conversation.lastMessage}
                    </Typography>
                    {conversation.unreadCount > 0 && (
                      <Badge
                        badgeContent={conversation.unreadCount}
                        color="primary"
                        sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
