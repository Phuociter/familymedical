import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

/**
 * TypingIndicator component shows when the other user is typing
 * Requirements: 10.4
 */
export default function TypingIndicator({ userName }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        ml: 5.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          p: 1.5,
          bgcolor: 'grey.200',
          borderRadius: 3,
          borderTopLeftRadius: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'grey.600',
              animation: `${bounce} 1.4s infinite ease-in-out`,
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </Box>
      <Typography 
        variant="caption" 
        color="textSecondary"
        sx={{ ml: 1 }}
      >
        {userName} đang soạn tin...
      </Typography>
    </Box>
  );
}
