/**
 * Message Subscription Hooks
 * 
 * This file provides hooks for subscribing to real-time message and conversation updates.
 * 
 * NOTE: For most use cases, use the subscriptions built into useMessages and useConversations
 * which use the subscribeToMore pattern for better cache management.
 * 
 * These standalone hooks are useful when you need to listen to events globally
 * (e.g., for notifications) without being tied to a specific query.
 */

import { useSubscription } from '@apollo/client/react';
import { 
  MESSAGE_RECEIVED_SUBSCRIPTION, 
  CONVERSATION_UPDATED_SUBSCRIPTION
} from '../graphql/messagingSubscriptions';

/**
 * Hook for subscribing to new messages globally
 * Use this for notifications or when you need to react to any new message
 * 
 * @param {Function} onNewMessage - Callback when a new message is received
 * @param {Object} options - Additional subscription options
 * @returns {Object} Subscription state { data, loading, error }
 */
export const useMessageSubscription = (onNewMessage, options = {}) => {
  const { data, loading, error } = useSubscription(MESSAGE_RECEIVED_SUBSCRIPTION, {
    ...options,
    onData: ({ data: subscriptionResult }) => {
      const message = subscriptionResult?.data?.messageReceived;
      if (message && onNewMessage) {
        onNewMessage(message);
      }
    },
    onError: (error) => {
      console.error('❌ Message subscription error:', error);
      if (options.onError) {
        options.onError(error);
      }
    },
  });

  return {
    message: data?.messageReceived,
    loading,
    error,
  };
};

/**
 * Hook for subscribing to conversation updates globally
 * Use this for notifications or sidebar updates
 * 
 * @param {Function} onConversationUpdate - Callback when a conversation is updated
 * @param {Object} options - Additional subscription options
 * @returns {Object} Subscription state { data, loading, error }
 */
export const useConversationSubscription = (onConversationUpdate, options = {}) => {
  const { data, loading, error } = useSubscription(CONVERSATION_UPDATED_SUBSCRIPTION, {
    ...options,
    onData: ({ data: subscriptionResult }) => {
      const conversation = subscriptionResult?.data?.conversationUpdated;
      if (conversation && onConversationUpdate) {
        onConversationUpdate(conversation);
      }
    },
    onError: (error) => {
      console.error('❌ Conversation subscription error:', error);
      if (options.onError) {
        options.onError(error);
      }
    },
  });

  return {
    conversation: data?.conversationUpdated,
    loading,
    error,
  };
};

export default useMessageSubscription;
