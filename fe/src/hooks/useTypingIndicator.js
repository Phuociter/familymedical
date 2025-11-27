import { useMutation, useSubscription } from '@apollo/client/react';
import { useCallback, useEffect, useRef } from 'react';
import { SEND_TYPING_INDICATOR } from '../graphql/messagingMutations';
import { TYPING_INDICATOR_SUBSCRIPTION } from '../graphql/messagingSubscriptions';
import { createSubscriptionOptions } from '../utils/subscriptionUtils';

/**
 * Hook for managing typing indicators in a conversation
 * @param {number} conversationID - The conversation ID
 * @param {Function} onTypingChange - Callback when typing status changes
 * @returns {Object} Typing indicator functions and state
 */
export const useTypingIndicator = (conversationID, onTypingChange) => {
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Mutation for sending typing indicator
  const [sendTypingIndicatorMutation] = useMutation(SEND_TYPING_INDICATOR);

  // Subscription for receiving typing indicators
  const { data: subscriptionData, error: subscriptionError } = useSubscription(
    TYPING_INDICATOR_SUBSCRIPTION,
    {
      variables: { conversationID },
      skip: !conversationID,
      ...createSubscriptionOptions({
        subscriptionName: 'TypingIndicator',
        onData: (data) => {
          if (data.typingIndicator && onTypingChange) {
            onTypingChange(data.typingIndicator);
          }
        },
      }),
    }
  );

  useEffect(() => {
    if (subscriptionError) {
      console.error('Typing indicator subscription error:', subscriptionError);
    }
  }, [subscriptionError]);

  /**
   * Send typing indicator to the server
   * @param {boolean} isTyping - Whether user is typing
   */
  const sendTypingIndicator = useCallback(async (isTyping) => {
    if (!conversationID) return;

    try {
      await sendTypingIndicatorMutation({
        variables: {
          input: {
            conversationID,
            isTyping,
          },
        },
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [conversationID, sendTypingIndicatorMutation]);

  /**
   * Start typing indicator
   * Automatically stops after 3 seconds of inactivity
   */
  const startTyping = useCallback(() => {
    if (!conversationID) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingIndicator(true);
    }

    // Set timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [conversationID, sendTypingIndicator]);

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback(() => {
    if (!conversationID) return;

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Send stop typing indicator if currently typing
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingIndicator(false);
    }
  }, [conversationID, sendTypingIndicator]);

  /**
   * Handle input change - call this on every keystroke
   */
  const handleTyping = useCallback(() => {
    startTyping();
  }, [startTyping]);

  /**
   * Handle message send - call this when message is sent
   */
  const handleMessageSent = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Send stop typing on unmount if currently typing
      if (isTypingRef.current && conversationID) {
        sendTypingIndicator(false);
      }
    };
  }, [conversationID, sendTypingIndicator]);

  return {
    // Functions
    startTyping,
    stopTyping,
    handleTyping,
    handleMessageSent,
    // State
    typingUser: subscriptionData?.typingIndicator,
    isOtherUserTyping: subscriptionData?.typingIndicator?.isTyping || false,
    subscriptionError,
  };
};

export default useTypingIndicator;
