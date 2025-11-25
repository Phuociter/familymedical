import { useState, useEffect } from 'react';
import { Box, Avatar, IconButton, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';

export default function AvatarUpload({ currentAvatar, userName, onFileSelect, previewFile }) {
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);

  // Update preview when currentAvatar changes (after save)
  useEffect(() => {
    setPreviewUrl(currentAvatar);
  }, [currentAvatar]);

  // Update preview when a new file is selected
  useEffect(() => {
    if (previewFile) {
      const objectUrl = URL.createObjectURL(previewFile);
      setPreviewUrl(objectUrl);
      
      // Cleanup
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(currentAvatar);
    }
  }, [previewFile, currentAvatar]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    onFileSelect(file);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={previewUrl}
          sx={{
            width: { xs: 80, md: 100 },
            height: { xs: 80, md: 100 },
            border: '3px solid #1976d2',
          }}
        >
          {userName?.charAt(0)}
        </Avatar>

        <IconButton
          component="label"
          sx={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            bgcolor: '#1976d2',
            color: 'white',
            width: 36,
            height: 36,
            '&:hover': {
              bgcolor: '#1565c0',
            },
          }}
        >
          <Edit sx={{ fontSize: 18 }} />
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={handleFileSelect}
          />
        </IconButton>
      </Box>

      <Typography
        variant="caption"
        sx={{ mt: 1, color: '#666', textAlign: 'center' }}
      >
        Click vào icon để thay đổi ảnh đại diện
      </Typography>
    </Box>
  );
}
