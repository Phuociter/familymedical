import { useQuery, useApolloClient } from '@apollo/client/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { GET_CONVERSATION_MESSAGES, SEARCH_MESSAGES, GET_UNREAD_MESSAGE_COUNT, GET_MY_CONVERSATIONS } from '../graphql/messagingQueries';
import { useMessageSubscription } from './useMessageSubscription';

/**
 * Hook for fetching and managing messages in a conversation
 * @param {number} conversationID - The conversation ID
 * @param {Object} options - Configuration options
 * @param {number} options.page - Page number for pagination (default: 0)
 * @param {number} options.size - Page size for pagination (default: 50)
 * @returns {Object} Messages data and methods
 */
export const useMessages = (conversationID, { page = 0, size = 50 } = {}) => {
  const [currentPage, setCurrentPage] = useState(page);
  const [allMessages, setAllMessages] = useState([]);
  const client = useApolloClient();
  const conversationIDRef = useRef(conversationID);

  // Keep conversationID ref updated
  useEffect(() => {
    conversationIDRef.current = conversationID;
  }, [conversationID]);

  // Reset messages when conversation changes
  useEffect(() => {
    setCurrentPage(0);
    setAllMessages([]);
  }, [conversationID]);

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_CONVERSATION_MESSAGES, {
    variables: { conversationID, page: currentPage, size },
    skip: !conversationID,
    fetchPolicy: 'cache-first', // Use cache-first to prevent refetch on cache update
    nextFetchPolicy: 'cache-only', // After first fetch, only use cache (subscription will update it)
    notifyOnNetworkStatusChange: true,
  });

  // Update all messages when data changes
  useEffect(() => {
    if (data?.conversationMessages?.messages) {
      if (currentPage === 0) {
        // Reset messages on first page
        setAllMessages(data.conversationMessages.messages);
      } else {
        // Append messages for subsequent pages (avoid duplicates)
        setAllMessages(prev => {
          const newMessages = data.conversationMessages.messages.filter(
            newMsg => !prev.some(existingMsg => existingMsg.messageID === newMsg.messageID)
          );
          return [...prev, ...newMessages];
        });
      }
    }
  }, [data, currentPage]);

  // Subscribe to new messages
  useMessageSubscription((newMessage) => {
    console.log('📨 New message received via subscription:', newMessage);
    
    // Only add message if it belongs to current conversation
    const messageConvId = parseInt(newMessage.conversation.conversationID);
    const currentConvId = parseInt(conversationIDRef.current);
    
    console.log('🔍 Comparison:', messageConvId, '===', currentConvId, '?', messageConvId === currentConvId);
    
    if (messageConvId === currentConvId) {
      console.log('✅ Message belongs to current conversation, adding to state');
      setAllMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some((msg) => msg.messageID === newMessage.messageID);
        if (exists) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }
        
        console.log('✅ Adding new message to state');
        // Add new message at the beginning (most recent first)
        return [newMessage, ...prev];
      });

      // Also update Apollo cache
      try {
        const messagesData = client.readQuery({
          query: GET_CONVERSATION_MESSAGES,
          variables: { conversationID: currentConvId, page: 0, size },
        });

        if (messagesData) {
          const exists = messagesData.conversationMessages.messages.some(
            msg => msg.messageID === newMessage.messageID
          );

          if (!exists) {
            client.writeQuery({
              query: GET_CONVERSATION_MESSAGES,
              variables: { conversationID: currentConvId, page: 0, size },
              data: {
                conversationMessages: {
                  ...messagesData.conversationMessages,
                  messages: [newMessage, ...messagesData.conversationMessages.messages],
                  totalCount: messagesData.conversationMessages.totalCount + 1,
                },
              },
            });
          }
        }
      } catch (e) {
        console.warn('Cache update for new message failed:', e);
      }
    } else {
      console.log('❌ Message does not belong to current conversation');
      
      // Still update conversation list cache for unread count
      try {
        const conversationsData = client.readQuery({
          query: GET_MY_CONVERSATIONS,
        });

        if (conversationsData) {
          const updatedConversations = conversationsData.myConversations.map(conv => {
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
  });

  const messages = allMessages;
  const totalCount = data?.conversationMessages?.totalCount || 0;
  const hasMore = data?.conversationMessages?.hasMore || false;

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return Promise.resolve();
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    return fetchMore({
      variables: { conversationID, page: nextPage, size },
    });
  }, [conversationID, currentPage, size, hasMore, loading, fetchMore]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setAllMessages([]);
    return refetch({ conversationID, page: 0, size });
  }, [conversationID, size, refetch]);

  // Add optimistic message immediately (for pending state)
  const addOptimisticMessage = useCallback((newMessage) => {
    setAllMessages(prev => {
      // Check if already exists
      const exists = prev.some(msg => 
        msg.messageID === newMessage.messageID || 
        msg.tempId === newMessage.tempId
      );
      if (exists) return prev;
      return [newMessage, ...prev];
    });
  }, []);

  // Update message status (pending -> sent -> read, or failed)
  const updateMessageStatus = useCallback((tempId, status, errorMessage, realMessage) => {
    setAllMessages(prev => prev.map(msg => {
      if (msg.tempId === tempId) {
        if (realMessage) {
          // Replace with real message from server
          return {
            ...realMessage,
            status,
          };
        }
        return {
          ...msg,
          status,
          errorMessage,
        };
      }
      return msg;
    }));
  }, []);

  // Remove a message (usually failed ones)
  const removeMessage = useCallback((tempId) => {
    setAllMessages(prev => prev.filter(msg => msg.tempId !== tempId));
  }, []);

  // Legacy addMessage (keep for backwards compatibility)
  const addMessage = useCallback((newMessage) => {
    setAllMessages(prev => [newMessage, ...prev]);
  }, []);

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
