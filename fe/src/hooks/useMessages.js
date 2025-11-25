import { useQuery } from '@apollo/client';
import { useState, useCallback, useEffect } from 'react';
import { GET_CONVERSATION_MESSAGES, SEARCH_MESSAGES, GET_UNREAD_MESSAGE_COUNT } from '../graphql/messagingQueries';

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

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_CONVERSATION_MESSAGES, {
    variables: { conversationID, page: currentPage, size },
    skip: !conversationID,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  // Update all messages when data changes
  useEffect(() => {
    if (data?.conversationMessages?.messages) {
      if (currentPage === 0) {
        // Reset messages on first page
        setAllMessages(data.conversationMessages.messages);
      } else {
        // Append messages for subsequent pages
        setAllMessages(prev => [...prev, ...data.conversationMessages.messages]);
      }
    }
  }, [data, currentPage]);

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
