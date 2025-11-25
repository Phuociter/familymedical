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

export default function ChatAreaSkeleton() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header Skeleton */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 80,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton variant="text" width={120} height={28} />
            <Skeleton variant="text" width={80} height={16} />
          </Box>
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>

      {/* Messages Area Skeleton */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflow: 'auto',
          bgcolor: 'grey.50',
        }}
      >
        <Stack spacing={0}>
          <MessageBubbleSkeleton isFromDoctor={false} />
          <MessageBubbleSkeleton isFromDoctor={true} />
          <MessageBubbleSkeleton isFromDoctor={false} />
          <MessageBubbleSkeleton isFromDoctor={true} />
          <MessageBubbleSkeleton isFromDoctor={false} />
        </Stack>
      </Box>

      {/* Message Input Skeleton */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" sx={{ flex: 1, height: 40, borderRadius: '12px' }} />
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '12px' }} />
        </Box>
      </Box>
    </Box>
  );
}
