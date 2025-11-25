import { useMutation } from '@apollo/client';
import { useState, useCallback } from 'react';
import { SEND_MESSAGE, MARK_MESSAGE_AS_READ, MARK_CONVERSATION_AS_READ } from '../graphql/messagingMutations';
import { GET_MY_CONVERSATIONS, GET_CONVERSATION_MESSAGES } from '../graphql/messagingQueries';

/**
 * Hook for sending messages with file upload support
 * @param {Object} options - Configuration options
 * @param {Function} options.onCompleted - Callback when message is sent successfully
 * @param {Function} options.onError - Callback when message sending fails
 * @returns {Object} Send message function and state
 */
export const useSendMessage = ({ onCompleted, onError } = {}) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const [sendMessageMutation, { loading, error, data }] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      setUploadProgress(0);
      if (onCompleted) {
        onCompleted(data.sendMessage);
      }
    },
    onError: (error) => {
      setUploadProgress(0);
      if (onError) {
        onError(error);
      }
    },
    // Update cache after sending message
    update: (cache, { data: { sendMessage } }) => {
      try {
        // Update conversation list cache
        const conversationsData = cache.readQuery({
          query: GET_MY_CONVERSATIONS,
        });

        if (conversationsData) {
          const updatedConversations = conversationsData.myConversations.map(conv => {
            if (conv.conversationID === sendMessage.conversation.conversationID) {
              return {
                ...conv,
                lastMessage: sendMessage,
                lastMessageAt: sendMessage.createdAt,
              };
            }
            return conv;
          });

          cache.writeQuery({
            query: GET_MY_CONVERSATIONS,
            data: { myConversations: updatedConversations },
          });
        }

        // Update messages cache
        const messagesData = cache.readQuery({
          query: GET_CONVERSATION_MESSAGES,
          variables: { conversationID: sendMessage.conversation.conversationID, page: 0, size: 50 },
        });

        if (messagesData) {
          cache.writeQuery({
            query: GET_CONVERSATION_MESSAGES,
            variables: { conversationID: sendMessage.conversation.conversationID, page: 0, size: 50 },
            data: {
              conversationMessages: {
                ...messagesData.conversationMessages,
                messages: [sendMessage, ...messagesData.conversationMessages.messages],
                totalCount: messagesData.conversationMessages.totalCount + 1,
              },
            },
          });
        }
      } catch (e) {
        // Cache update errors are non-critical
        console.warn('Cache update failed:', e);
      }
    },
  });

  /**
   * Send a message with optional file attachments
   * @param {Object} params - Message parameters
   * @param {number} params.conversationID - Existing conversation ID (optional)
   * @param {number} params.recipientID - Recipient user ID
   * @param {string} params.content - Message content
   * @param {File[]} params.attachments - File attachments (optional)
   */
  const sendMessage = useCallback(async ({ conversationID, recipientID, content, attachments }) => {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    // Validate recipient
    if (!recipientID) {
      throw new Error('Recipient ID is required');
    }

    // Prepare variables
    const variables = {
      input: {
        recipientID,
        content: content.trim(),
      },
    };

    // Add conversation ID if provided
    if (conversationID) {
      variables.input.conversationID = conversationID;
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      // Validate file sizes (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      for (const file of attachments) {
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} exceeds maximum size of 10MB`);
        }
      }

      variables.input.attachments = attachments;
      setUploadProgress(10); // Start progress indicator
    }

    try {
      const result = await sendMessageMutation({ variables });
      return result.data.sendMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [sendMessageMutation]);

  return {
    sendMessage,
    loading,
    error,
    uploadProgress,
    sentMessage: data?.sendMessage,
  };
};

/**
 * Hook for marking a message as read
 * @returns {Object} Mark as read function and state
 */
export const useMarkMessageAsRead = () => {
  const [markAsReadMutation, { loading, error }] = useMutation(MARK_MESSAGE_AS_READ);

  const markAsRead = useCallback(async (messageID) => {
    try {
      const result = await markAsReadMutation({
        variables: {
          input: { messageID },
        },
      });
      return result.data.markMessageAsRead;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }, [markAsReadMutation]);

  return {
    markAsRead,
    loading,
    error,
  };
};

/**
 * Hook for marking all messages in a conversation as read
 * @returns {Object} Mark conversation as read function and state
 */
export const useMarkConversationAsRead = () => {
  const [markConversationAsReadMutation, { loading, error }] = useMutation(MARK_CONVERSATION_AS_READ, {
    // Refetch conversations to update unread counts
    refetchQueries: [{ query: GET_MY_CONVERSATIONS }],
  });

  const markConversationAsRead = useCallback(async (conversationID) => {
    try {
      const result = await markConversationAsReadMutation({
        variables: { conversationID },
      });
      return result.data.markConversationAsRead;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }, [markConversationAsReadMutation]);

  return {
    markConversationAsRead,
    loading,
    error,
  };
};

export default useSendMessage;
