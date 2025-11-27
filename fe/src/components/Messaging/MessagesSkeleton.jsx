import { Box, Skeleton, Stack } from '@mui/material';

const MessageBubbleSkeleton = ({ isOwnMessage }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      mb: 2.5,
    }}
  >
    {!isOwnMessage && (
      <Skeleton variant="circular" width={36} height={36} sx={{ mr: 1.5 }} />
    )}
    <Box sx={{ maxWidth: '65%' }}>
      {!isOwnMessage && (
        <Skeleton variant="text" width={80} height={14} sx={{ mb: 0.5, px: 1 }} />
      )}
      <Skeleton 
        variant="rounded" 
        width={Math.random() * 150 + 150} 
        height={60} 
        sx={{ 
          borderRadius: 3,
          borderTopRightRadius: isOwnMessage ? 4 : 16,
          borderTopLeftRadius: isOwnMessage ? 16 : 4,
        }} 
      />
      <Skeleton 
        variant="text" 
        width={60} 
        height={12} 
        sx={{ 
          mt: 0.5, 
          px: 1,
          ml: isOwnMessage ? 'auto' : 0,
          mr: isOwnMessage ? 0 : 'auto',
        }} 
      />
    </Box>
  </Box>
);

export default function MessagesSkeleton() {
  return (
    <Stack spacing={0} sx={{ p: 2 }}>
      <MessageBubbleSkeleton isOwnMessage={false} />
      <MessageBubbleSkeleton isOwnMessage={true} />
      <MessageBubbleSkeleton isOwnMessage={false} />
      <MessageBubbleSkeleton isOwnMessage={true} />
      <MessageBubbleSkeleton isOwnMessage={false} />
      <MessageBubbleSkeleton isOwnMessage={true} />
    </Stack>
  );
}

