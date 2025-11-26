import { useMutation } from '@apollo/client/react';
import { useState, useCallback, useRef } from 'react';
import { SEND_MESSAGE, MARK_MESSAGE_AS_READ, MARK_CONVERSATION_AS_READ } from '../graphql/messagingMutations';
import { GET_MY_CONVERSATIONS, GET_CONVERSATION_MESSAGES } from '../graphql/messagingQueries';

// Message status constants
export const MESSAGE_STATUS = {
  PENDING: 'pending',    // Đang gửi
  SENT: 'sent',          // Đã gửi (server received)
  DELIVERED: 'delivered', // Đã chuyển (recipient received) 
  READ: 'read',          // Đã xem
  FAILED: 'failed',      // Gửi thất bại
};

// Generate temporary ID for optimistic messages
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Hook for sending messages with optimistic updates and status tracking
 * @param {Object} options - Configuration options
 * @param {Function} options.onCompleted - Callback when message is sent successfully
 * @param {Function} options.onError - Callback when message sending fails
 * @param {Object} options.currentUser - Current user object for optimistic updates
 * @returns {Object} Send message function and state
 */
export const useSendMessage = ({ onCompleted, onError, currentUser } = {}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingMessages, setPendingMessages] = useState([]);
  const tempIdMapRef = useRef(new Map()); // Map temp IDs to real IDs

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
    // No automatic cache update - we handle it manually with optimistic updates
  });

  /**
   * Send a message with optimistic update
   * @param {Object} params - Message parameters
   * @param {number} params.conversationID - Existing conversation ID (optional)
   * @param {number} params.recipientID - Recipient user ID
   * @param {string} params.content - Message content
   * @param {File[]} params.attachments - File attachments (optional)
   * @param {Function} params.onOptimisticUpdate - Callback to add message to UI immediately
   * @param {Function} params.onStatusUpdate - Callback to update message status
   */
  const sendMessage = useCallback(async ({ 
    conversationID, 
    recipientID, 
    content, 
    attachments,
    onOptimisticUpdate,
    onStatusUpdate,
  }) => {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    // Validate recipient
    if (!recipientID) {
      throw new Error('Recipient ID is required');
    }

    const trimmedContent = content.trim();
    const tempId = generateTempId();
    const now = new Date().toISOString();

    // Create optimistic message
    const optimisticMessage = {
      messageID: tempId,
      tempId: tempId,
      conversation: { conversationID: conversationID || 'new' },
      sender: currentUser ? {
        userID: currentUser.userID,
        fullName: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl,
      } : { userID: 0, fullName: 'Bạn' },
      content: trimmedContent,
      attachments: attachments?.map((file, idx) => ({
        attachmentID: `temp_att_${idx}`,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: now,
      })) || [],
      isRead: false,
      readAt: null,
      createdAt: now,
      status: MESSAGE_STATUS.PENDING,
    };

    // Add to pending messages
    setPendingMessages(prev => [...prev, optimisticMessage]);

    // Call optimistic update callback to add message to UI immediately
    if (onOptimisticUpdate) {
      onOptimisticUpdate(optimisticMessage);
    }

    // Prepare variables
    const variables = {
      input: {
        recipientID,
        content: trimmedContent,
      },
    };

    if (conversationID) {
      variables.input.conversationID = conversationID;
    }

    if (attachments && attachments.length > 0) {
      const maxSize = 10 * 1024 * 1024;
      for (const file of attachments) {
        if (file.size > maxSize) {
          // Update status to failed
          if (onStatusUpdate) {
            onStatusUpdate(tempId, MESSAGE_STATUS.FAILED, `File ${file.name} vượt quá 10MB`);
          }
          setPendingMessages(prev => prev.filter(m => m.tempId !== tempId));
          throw new Error(`File ${file.name} exceeds maximum size of 10MB`);
        }
      }
      variables.input.attachments = attachments;
      setUploadProgress(10);
    }

    try {
      const result = await sendMessageMutation({ variables });
      const sentMessage = result.data.sendMessage;
      
      // Map temp ID to real ID
      tempIdMapRef.current.set(tempId, sentMessage.messageID);
      
      // Update status to sent
      if (onStatusUpdate) {
        onStatusUpdate(tempId, MESSAGE_STATUS.SENT, null, sentMessage);
      }
      
      // Remove from pending
      setPendingMessages(prev => prev.filter(m => m.tempId !== tempId));
      
      return sentMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update status to failed
      if (onStatusUpdate) {
        onStatusUpdate(tempId, MESSAGE_STATUS.FAILED, error.message);
      }
      
      throw error;
    }
  }, [sendMessageMutation, currentUser]);

  // Retry failed message
  const retryMessage = useCallback(async (tempId, params) => {
    const pendingMsg = pendingMessages.find(m => m.tempId === tempId);
    if (!pendingMsg) return;

    // Reset status to pending
    setPendingMessages(prev => 
      prev.map(m => m.tempId === tempId ? { ...m, status: MESSAGE_STATUS.PENDING } : m)
    );

    return sendMessage({ ...params, onOptimisticUpdate: null }); // Don't add duplicate
  }, [pendingMessages, sendMessage]);

  // Remove failed message
  const removeFailedMessage = useCallback((tempId, onRemove) => {
    setPendingMessages(prev => prev.filter(m => m.tempId !== tempId));
    if (onRemove) {
      onRemove(tempId);
    }
  }, []);

  return {
    sendMessage,
    loading,
    error,
    uploadProgress,
    sentMessage: data?.sendMessage,
    pendingMessages,
    retryMessage,
    removeFailedMessage,
    MESSAGE_STATUS,
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
    // Optimistic update - update cache immediately
    update: (cache, { data }, { variables }) => {
      try {
        const conversationID = variables.conversationID;
        
        // Update conversations list cache
        const conversationsData = cache.readQuery({
          query: GET_MY_CONVERSATIONS,
        });

        if (conversationsData) {
          const updatedConversations = conversationsData.myConversations.map(conv => {
            if (parseInt(conv.conversationID) === parseInt(conversationID)) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          });

          cache.writeQuery({
            query: GET_MY_CONVERSATIONS,
            data: { myConversations: updatedConversations },
          });
        }

        // Update messages cache - mark all messages as read
        const messagesData = cache.readQuery({
          query: GET_CONVERSATION_MESSAGES,
          variables: { conversationID, page: 0, size: 50 },
        });

        if (messagesData) {
          const updatedMessages = messagesData.conversationMessages.messages.map(msg => ({
            ...msg,
            isRead: true,
            readAt: msg.readAt || new Date().toISOString(),
          }));

          cache.writeQuery({
            query: GET_CONVERSATION_MESSAGES,
            variables: { conversationID, page: 0, size: 50 },
            data: {
              conversationMessages: {
                ...messagesData.conversationMessages,
                messages: updatedMessages,
              },
            },
          });
        }
      } catch (e) {
        console.warn('Cache update for markConversationAsRead failed:', e);
      }
    },
  });

  const markConversationAsRead = useCallback(async (conversationID) => {
    try {
      const result = await markConversationAsReadMutation({
        variables: { conversationID },
        // Optimistic response for immediate UI update
        optimisticResponse: {
          markConversationAsRead: true,
        },
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
