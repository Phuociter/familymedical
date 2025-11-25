import {
  Box,
  List,
  ListItem,
  Skeleton,
  Stack,
} from '@mui/material';

const ConversationItemSkeleton = () => (
  <ListItem sx={{ py: 1.5, px: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="20%" height={16} />
        </Box>
        <Skeleton variant="text" width="80%" height={16} />
      </Box>
    </Box>
  </ListItem>
);

export default function ConversationListSkeleton() {
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
      {/* Search Bar Skeleton */}
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
        }}
      >
        <Skeleton variant="rounded" width="100%" height={40} />
      </Box>

      {/* Conversation List Skeleton */}
      <List sx={{ p: 0, overflow: 'auto', flex: 1 }}>
        {[...Array(8)].map((_, index) => (
          <ConversationItemSkeleton key={index} />
        ))}
      </List>
    </Box>
  );
}
