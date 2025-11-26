/**
 * Custom hook for message subscriptions
 * 
 * This hook provides real-time message and conversation updates via GraphQL subscriptions.
 */

import { useSubscription } from '@apollo/client/react';
import { useEffect } from 'react';
import { createSubscriptionOptions } from '../utils/subscriptionUtils';
import { 
  MESSAGE_RECEIVED_SUBSCRIPTION, 
  CONVERSATION_UPDATED_SUBSCRIPTION 
} from '../graphql/messagingSubscriptions';

/**
 * Hook for subscribing to new messages
 * @param {Function} onNewMessage - Callback when a new message is received
 * @returns {Object} Subscription state { message, loading, error }
 */
export const useMessageSubscription = (onNewMessage) => {
  const { data, loading, error } = useSubscription(
    MESSAGE_RECEIVED_SUBSCRIPTION,
    createSubscriptionOptions({
      subscriptionName: 'MessageReceived',
      onData: (data) => {
        if (data.messageReceived && onNewMessage) {
          onNewMessage(data.messageReceived);
        }
      },
    })
  );

  useEffect(() => {
    if (error) {
      console.error('Message subscription error:', error);
    }
  }, [error]);

  return {
    message: data?.messageReceived,
    loading,
    error,
  };
};

/**
 * Hook for subscribing to conversation updates
 * @param {Function} onConversationUpdate - Callback when a conversation is updated
 * @returns {Object} Subscription state { conversation, loading, error }
 */
export const useConversationSubscription = (onConversationUpdate) => {
  const { data, loading, error } = useSubscription(
    CONVERSATION_UPDATED_SUBSCRIPTION,
    createSubscriptionOptions({
      subscriptionName: 'ConversationUpdated',
      onData: (data) => {
        if (data.conversationUpdated && onConversationUpdate) {
          onConversationUpdate(data.conversationUpdated);
        }
      },
    })
  );

  useEffect(() => {
    if (error) {
      console.error('Conversation subscription error:', error);
    }
  }, [error]);

  return {
    conversation: data?.conversationUpdated,
    loading,
    error,
  };
};

export default useMessageSubscription;
