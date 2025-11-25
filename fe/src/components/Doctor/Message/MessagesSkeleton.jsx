import { Box, Skeleton, Stack } from '@mui/material';

const MessageBubbleSkeleton = ({ isFromDoctor }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isFromDoctor ? 'flex-end' : 'flex-start',
      mb: 2.5,
    }}
  >
    {!isFromDoctor && (
      <Skeleton variant="circular" width={36} height={36} sx={{ mr: 1.5 }} />
    )}
    <Box sx={{ maxWidth: '65%' }}>
      <Skeleton 
        variant="rounded" 
        width={Math.random() * 150 + 150} 
        height={60} 
        sx={{ borderRadius: 3 }} 
      />
      <Skeleton variant="text" width={60} height={16} sx={{ mt: 0.5 }} />
    </Box>
    {isFromDoctor && (
      <Skeleton variant="circular" width={36} height={36} sx={{ ml: 1.5 }} />
    )}
  </Box>
);

export default function MessagesSkeleton() {
  return (
    <Stack spacing={0}>
      <MessageBubbleSkeleton isFromDoctor={false} />
      <MessageBubbleSkeleton isFromDoctor={true} />
      <MessageBubbleSkeleton isFromDoctor={false} />
      <MessageBubbleSkeleton isFromDoctor={true} />
      <MessageBubbleSkeleton isFromDoctor={false} />
    </Stack>
  );
}
