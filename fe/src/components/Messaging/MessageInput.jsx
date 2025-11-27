import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

import { formatFileSize } from '../../utils/timeFormat';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * MessageInput component for composing and sending messages with file attachments
 * Requirements: 1.1, 1.2, 9.1
 */
export default function MessageInput({ 
  onSendMessage, 
  onTypingStart, 
  onTypingStop,
  disabled = false,
  sending = false,
}) {
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setMessageText(newText);
    setError('');

    // Trigger typing indicator
    if (newText.trim() && onTypingStart) {
      onTypingStart();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        if (onTypingStop) {
          onTypingStop();
        }
      }, 3000);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    let errorMsg = '';

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errorMsg = `File "${file.name}" vượt quá kích thước tối đa 10MB`;
        break;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errorMsg = `File "${file.name}" không được hỗ trợ. Chỉ chấp nhận ảnh, PDF và Word documents`;
        break;
      }

      validFiles.push(file);
    }

    if (errorMsg) {
      setError(errorMsg);
    } else {
      setAttachments([...attachments, ...validFiles]);
      setError('');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const trimmedText = messageText.trim();
    
    if (!trimmedText && attachments.length === 0) {
      return;
    }

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onTypingStop) {
      onTypingStop();
    }

    try {
      await onSendMessage(trimmedText, attachments);
      setMessageText('');
      setAttachments([]);
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể gửi tin nhắn');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (messageText.trim() || attachments.length > 0) && !disabled && !sending;

  return (
    <Box
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'white',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Error message */}
      {error && (
        <Box
          sx={{
            mb: 1,
            p: 1,
            bgcolor: 'error.lighter',
            color: 'error.dark',
            borderRadius: 1,
            fontSize: '0.875rem',
          }}
        >
          {error}
        </Box>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {attachments.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                maxWidth: 200,
              }}
            >
              <FileIcon fontSize="small" color="action" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </Box>
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {formatFileSize(file.size)}
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleRemoveAttachment(index)}
                disabled={sending}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_FILE_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        
        <Tooltip title="Đính kèm file">
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending}
            sx={{
              bgcolor: 'grey.100',
              borderRadius: '12px',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'grey.200',
              },
            }}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Nhập tin nhắn..."
          value={messageText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
        />

        <Tooltip title={canSend ? 'Gửi tin nhắn' : 'Nhập nội dung để gửi'}>
          <span>
            <IconButton
              onClick={handleSend}
              disabled={!canSend}
              sx={{
                bgcolor: canSend ? 'primary.main' : 'grey.100',
                color: canSend ? 'white' : 'grey.400',
                borderRadius: '12px',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: canSend ? 'primary.dark' : 'grey.200',
                },
                '&:disabled': {
                  bgcolor: 'grey.100',
                  color: 'grey.400',
                },
              }}
            >
              {sending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
