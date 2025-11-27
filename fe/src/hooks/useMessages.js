import { useQuery, useApolloClient } from '@apollo/client/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  GET_CONVERSATION_MESSAGES, 
  SEARCH_MESSAGES, 
  GET_UNREAD_MESSAGE_COUNT, 
  GET_MY_CONVERSATIONS 
} from '../graphql/messagingQueries';
import { MESSAGE_RECEIVED_SUBSCRIPTION } from '../graphql/messagingSubscriptions';

/**
 * Hook for fetching and managing messages in a conversation
 * Uses subscribeToMore pattern from Apollo Client for real-time updates
 * 
 * @param {number} conversationID - The conversation ID
 * @param {Object} options - Configuration options
 * @param {number} options.page - Page number for pagination (default: 0)
 * @param {number} options.size - Page size for pagination (default: 50)
 * @returns {Object} Messages data and methods
 */
export const useMessages = (conversationID, { page = 0, size = 50 } = {}) => {
  const [currentPage, setCurrentPage] = useState(page);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const client = useApolloClient();
  const currentUser = useSelector((state) => state.user.user);
  const subscriptionRef = useRef(null);
  const conversationIDRef = useRef(conversationID);

  // Keep conversationID ref updated
  useEffect(() => {
    conversationIDRef.current = conversationID;
  }, [conversationID]);

  // Reset state when conversation changes
  useEffect(() => {
    setCurrentPage(0);
    setOptimisticMessages([]);
  }, [conversationID]);

  const { data, loading, error, refetch, fetchMore, subscribeToMore } = useQuery(
    GET_CONVERSATION_MESSAGES,
    {
      variables: { conversationID, page: currentPage, size },
      skip: !conversationID,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  // Setup subscription using subscribeToMore
  useEffect(() => {
    if (!conversationID || !subscribeToMore) return;

    // Clean up previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    console.log('📡 Setting up message subscription for conversation:', conversationID);

    const unsubscribe = subscribeToMore({
      document: MESSAGE_RECEIVED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data?.messageReceived) {
          return prev;
        }

        const newMessage = subscriptionData.data.messageReceived;
        const messageConvId = parseInt(newMessage.conversation?.conversationID);
        const currentConvId = parseInt(conversationIDRef.current);

        console.log('📨 Subscription received message:', {
          messageID: newMessage.messageID,
          messageConvId,
          currentConvId,
          content: newMessage.content?.substring(0, 30),
        });

        // Only process messages for current conversation
        if (messageConvId !== currentConvId) {
          console.log('❌ Message not for current conversation, updating sidebar only');
          // Update conversation list for other conversations (unread count)
          updateConversationListCache(client, newMessage, messageConvId);
          return prev;
        }

        // Check if message already exists in cache (avoid duplicates)
        const existingMessages = prev?.conversationMessages?.messages || [];
        const exists = existingMessages.some(
          (msg) => String(msg.messageID) === String(newMessage.messageID)
        );

        if (exists) {
          console.log('⚠️ Message already exists in cache, skipping');
          return prev;
        }

        // Check if this is the current user's own message (sent via mutation)
        // In this case, we already have the optimistic message - don't add duplicate
        const isOwnMessage = newMessage.sender?.userID === currentUser?.userID;
        if (isOwnMessage) {
          // Check if there's an optimistic message with same content recently added
          const recentOptimistic = existingMessages.find((msg) => {
            const isTempMessage = String(msg.messageID).startsWith('temp_');
            if (!isTempMessage) return false;
            
            const sameContent = msg.content === newMessage.content;
            const timeDiff = Math.abs(
              new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()
            );
            return sameContent && timeDiff < 15000; // Within 15 seconds
          });

          if (recentOptimistic) {
            console.log('🔄 Own message received via subscription, replacing optimistic');
            // Replace the optimistic message with real message
            return {
              conversationMessages: {
                ...prev.conversationMessages,
                messages: existingMessages.map((msg) =>
                  String(msg.messageID) === String(recentOptimistic.messageID)
                    ? { ...newMessage, __typename: 'Message' }
                    : msg
                ),
              },
            };
          }
        }

        console.log('✅ Adding new message to cache');
        // Add new message at the beginning (most recent first)
        return {
          conversationMessages: {
            ...prev.conversationMessages,
            messages: [{ ...newMessage, __typename: 'Message' }, ...existingMessages],
            totalCount: (prev.conversationMessages?.totalCount || 0) + 1,
          },
        };
      },
      onError: (error) => {
        console.error('❌ Message subscription error:', error);
      },
    });

    subscriptionRef.current = unsubscribe;

    // Cleanup on unmount or conversation change
    return () => {
      if (subscriptionRef.current) {
        console.log('🔌 Cleaning up message subscription');
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [conversationID, subscribeToMore, client, currentUser?.userID]);

  // Merge cache messages with optimistic messages
  const cacheMessages = data?.conversationMessages?.messages || [];
  const messages = mergeMessages(cacheMessages, optimisticMessages);
  const totalCount = data?.conversationMessages?.totalCount || 0;
  const hasMore = data?.conversationMessages?.hasMore || false;

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return Promise.resolve();

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    return fetchMore({
      variables: { conversationID, page: nextPage, size },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const existingIds = new Set(
          prev.conversationMessages.messages.map((m) => m.messageID)
        );
        const newMessages = fetchMoreResult.conversationMessages.messages.filter(
          (m) => !existingIds.has(m.messageID)
        );

        return {
          conversationMessages: {
            ...fetchMoreResult.conversationMessages,
            messages: [...prev.conversationMessages.messages, ...newMessages],
          },
        };
      },
    });
  }, [conversationID, currentPage, size, hasMore, loading, fetchMore]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setOptimisticMessages([]);
    return refetch({ conversationID, page: 0, size });
  }, [conversationID, size, refetch]);

  // Add optimistic message immediately (for pending state)
  const addOptimisticMessage = useCallback((newMessage) => {
    console.log('➕ Adding optimistic message:', newMessage.tempId);
    
    // Add to optimistic messages list
    setOptimisticMessages((prev) => {
      const exists = prev.some(
        (msg) => msg.tempId === newMessage.tempId || msg.messageID === newMessage.messageID
      );
      if (exists) return prev;
      return [newMessage, ...prev];
    });

    // Also add to Apollo cache for immediate display
    try {
      const cachedData = client.readQuery({
        query: GET_CONVERSATION_MESSAGES,
        variables: { conversationID, page: 0, size },
      });

      if (cachedData) {
        client.writeQuery({
          query: GET_CONVERSATION_MESSAGES,
          variables: { conversationID, page: 0, size },
          data: {
            conversationMessages: {
              ...cachedData.conversationMessages,
              messages: [
                { ...newMessage, __typename: 'Message' },
                ...cachedData.conversationMessages.messages,
              ],
            },
          },
        });
      }
    } catch (e) {
      console.warn('Failed to add optimistic message to cache:', e);
    }
  }, [client, conversationID, size]);

  // Update message status (pending -> sent, or failed)
  const updateMessageStatus = useCallback((tempId, status, errorMessage, realMessage) => {
    console.log('🔄 Updating message status:', { tempId, status, hasRealMessage: !!realMessage });

    // Remove from optimistic messages
    setOptimisticMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));

    // Update Apollo cache
    try {
      const cachedData = client.readQuery({
        query: GET_CONVERSATION_MESSAGES,
        variables: { conversationID, page: 0, size },
      });

      if (cachedData) {
        const updatedMessages = cachedData.conversationMessages.messages.map((msg) => {
          // Find the optimistic message by tempId (stored in messageID for temp messages)
          if (String(msg.messageID) === tempId || msg.tempId === tempId) {
            if (realMessage) {
              // Replace with real message from server
              return { ...realMessage, status, __typename: 'Message' };
            }
            // Just update status
            return { ...msg, status, errorMessage };
          }
          return msg;
        });

        // If realMessage exists but wasn't found (subscription might have added it)
        // Check for duplicates
        if (realMessage) {
          const realExists = updatedMessages.some(
            (msg) => String(msg.messageID) === String(realMessage.messageID)
          );
          if (!realExists) {
            // Real message not in cache, but optimistic was found and updated
            // This is handled above
          } else {
            // Real message already exists, remove the temp one
            const filteredMessages = updatedMessages.filter(
              (msg) => String(msg.messageID) !== tempId && msg.tempId !== tempId
            );
            if (filteredMessages.length !== updatedMessages.length) {
              client.writeQuery({
                query: GET_CONVERSATION_MESSAGES,
                variables: { conversationID, page: 0, size },
                data: {
                  conversationMessages: {
                    ...cachedData.conversationMessages,
                    messages: filteredMessages,
                  },
                },
              });
              return;
            }
          }
        }

        client.writeQuery({
          query: GET_CONVERSATION_MESSAGES,
          variables: { conversationID, page: 0, size },
          data: {
            conversationMessages: {
              ...cachedData.conversationMessages,
              messages: updatedMessages,
            },
          },
        });
      }
    } catch (e) {
      console.warn('Failed to update message status in cache:', e);
    }
  }, [client, conversationID, size]);

  // Remove a message (usually failed ones)
  const removeMessage = useCallback((tempId) => {
    console.log('🗑️ Removing message:', tempId);
    
    setOptimisticMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));

    try {
      const cachedData = client.readQuery({
        query: GET_CONVERSATION_MESSAGES,
        variables: { conversationID, page: 0, size },
      });

      if (cachedData) {
        client.writeQuery({
          query: GET_CONVERSATION_MESSAGES,
          variables: { conversationID, page: 0, size },
          data: {
            conversationMessages: {
              ...cachedData.conversationMessages,
              messages: cachedData.conversationMessages.messages.filter(
                (msg) => String(msg.messageID) !== tempId && msg.tempId !== tempId
              ),
            },
          },
        });
      }
    } catch (e) {
      console.warn('Failed to remove message from cache:', e);
    }
  }, [client, conversationID, size]);

  // Legacy addMessage (keep for backwards compatibility)
  const addMessage = useCallback((newMessage) => {
    addOptimisticMessage(newMessage);
  }, [addOptimisticMessage]);

  return {
    messages,
    totalCount,
    hasMore,
    loading,
    error,
    refetch: refresh,
    loadMore,
    addMessage,
    addOptimisticMessage,
    updateMessageStatus,
    removeMessage,
  };
};

/**
 * Helper function to merge cache messages with optimistic messages
 * Avoids duplicates by checking messageID and tempId
 */
function mergeMessages(cacheMessages, optimisticMessages) {
  if (optimisticMessages.length === 0) return cacheMessages;

  const result = [...cacheMessages];
  const existingIds = new Set(cacheMessages.map((m) => String(m.messageID)));

  for (const optMsg of optimisticMessages) {
    // Don't add if already in cache (by messageID or tempId)
    if (existingIds.has(String(optMsg.messageID)) || existingIds.has(optMsg.tempId)) {
      continue;
    }
    result.unshift(optMsg);
  }

  return result;
}

/**
 * Helper function to update conversation list cache when message received for other conversation
 */
function updateConversationListCache(client, newMessage, messageConvId) {
  try {
    const conversationsData = client.readQuery({
      query: GET_MY_CONVERSATIONS,
    });

    if (conversationsData) {
      const updatedConversations = conversationsData.myConversations.map((conv) => {
        if (parseInt(conv.conversationID) === messageConvId) {
          return {
            ...conv,
            lastMessage: newMessage,
            lastMessageAt: newMessage.createdAt,
            unreadCount: (conv.unreadCount || 0) + 1,
          };
        }
        return conv;
      });

      // Sort by lastMessageAt
      updatedConversations.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });

      client.writeQuery({
        query: GET_MY_CONVERSATIONS,
        data: { myConversations: updatedConversations },
      });
    }
  } catch (e) {
    console.warn('Cache update for conversation list failed:', e);
  }
}

/**
 * Hook for searching messages
 * @param {Object} searchInput - Search parameters
 * @param {string} searchInput.keyword - Search keyword
 * @param {number} searchInput.conversationID - Filter by conversation
 * @param {string} searchInput.startDate - Start date filter
 * @param {string} searchInput.endDate - End date filter
 * @param {number} searchInput.page - Page number
 * @param {number} searchInput.size - Page size
 * @returns {Object} Search results and methods
 */
export const useMessageSearch = (searchInput) => {
  const { data, loading, error, refetch } = useQuery(SEARCH_MESSAGES, {
    variables: { input: searchInput },
    skip: !searchInput?.keyword,
    fetchPolicy: 'network-only',
  });

  const messages = data?.searchMessages?.messages || [];
  const totalCount = data?.searchMessages?.totalCount || 0;
  const hasMore = data?.searchMessages?.hasMore || false;

  return {
    messages,
    totalCount,
    hasMore,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for getting unread message count
 * @param {Object} options - Query options
 * @returns {Object} Unread count data
 */
export const useUnreadMessageCount = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_UNREAD_MESSAGE_COUNT, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000, // Poll every 30 seconds
    ...options,
  });

  return {
    unreadCount: data?.unreadMessageCount || 0,
    loading,
    error,
    refetch,
  };
};

export default useMessages;
