import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useState } from 'react';

// Mock data - sẽ thay bằng GraphQL sau
const mockConversations = [
  { id: 1, name: 'Nguyễn Văn A', lastMessage: 'Cảm ơn bác sĩ', time: '10:30' },
  { id: 2, name: 'Trần Thị B', lastMessage: 'Khi nào có kết quả?', time: '09:15' },
  { id: 3, name: 'Lê Văn C', lastMessage: 'Đã uống thuốc theo đơn', time: 'Hôm qua' },
];

export default function DoctorMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement send message logic
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Tin nhắn
      </Typography>

      <Paper sx={{ height: 'calc(100vh - 200px)', display: 'flex' }}>
        {/* Conversations List */}
        <Box
          sx={{
            width: 320,
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto',
          }}
        >
          <List sx={{ p: 0 }}>
            {mockConversations.map((conversation) => (
              <ListItem key={conversation.id} disablePadding>
                <ListItemButton
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#1976d2' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.name}
                    secondary={conversation.lastMessage}
                    secondaryTypographyProps={{
                      noWrap: true,
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {conversation.time}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{selectedConversation.name}</Typography>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, p: 2, overflow: 'auto', bgcolor: '#f5f5f5' }}>
                <Typography color="textSecondary" align="center">
                  Chức năng tin nhắn đang được phát triển
                </Typography>
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    size="small"
                  />
                  <IconButton color="primary" onClick={handleSendMessage}>
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="textSecondary">
                Chọn một cuộc trò chuyện để bắt đầu
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
