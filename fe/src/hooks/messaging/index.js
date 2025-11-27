/**
 * Messaging Hooks
 * 
 * This module exports all messaging-related hooks for easy import.
 * 
 * Usage:
 * import { useConversations, useSendMessage, useMessages } from '../hooks/messaging';
 */

// Conversation hooks
export { 
  useConversations, 
  useConversationDetail, 
  useConversationWithUser 
} from '../useConversations';

// Message hooks
export { 
  useMessages, 
  useMessageSearch, 
  useUnreadMessageCount 
} from '../useMessages';

// Send message hooks
export { 
  useSendMessage, 
  useMarkMessageAsRead, 
  useMarkConversationAsRead 
} from '../useSendMessage';

// Subscription hooks
export { 
  useMessageSubscription, 
  useConversationSubscription 
} from '../useMessageSubscription';

// Typing indicator hook
export { useTypingIndicator } from '../useTypingIndicator';
