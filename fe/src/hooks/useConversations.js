import { useQuery } from '@apollo/client';
import { useState, useCallback } from 'react';
import { GET_MY_CONVERSATIONS, GET_CONVERSATION_DETAIL, GET_CONVERSATION_WITH_USER } from '../graphql/messagingQueries';

/**
 * Hook for fetching and managing conversations
 * @param {Object} options - Configuration options
 * @param {number} options.page - Page number for pagination (default: 0)
 * @param {number} options.size - Page size for pagination (default: 20)
 * @returns {Object} Conversations data and methods
 */
export const useConversations = ({ page = 0, size = 20 } = {}) => {
  const [currentPage, setCurrentPage] = useState(page);

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_MY_CONVERSATIONS, {
    variables: { page: currentPage, size },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const conversations = data?.myConversations || [];

  const loadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    return fetchMore({
      variables: { page: nextPage, size },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          myConversations: [...prev.myConversations, ...fetchMoreResult.myConversations],
        };
      },
    });
  }, [currentPage, size, fetchMore]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    return refetch({ page: 0, size });
  }, [refetch, size]);

  return {
    conversations,
    loading,
    error,
    refetch: refresh,
    loadMore,
    hasMore: conversations.length >= (currentPage + 1) * size,
  };
};

/**
 * Hook for fetching a specific conversation by ID
 * @param {number} conversationID - The conversation ID
 * @param {Object} options - Query options
 * @returns {Object} Conversation data and methods
 */
export const useConversationDetail = (conversationID, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CONVERSATION_DETAIL, {
    variables: { conversationID },
    skip: !conversationID,
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    conversation: data?.conversationDetail,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for getting or creating a conversation with a specific user
 * @param {number} otherUserID - The other user's ID
 * @param {Object} options - Query options
 * @returns {Object} Conversation data and methods
 */
export const useConversationWithUser = (otherUserID, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CONVERSATION_WITH_USER, {
    variables: { otherUserID },
    skip: !otherUserID,
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    conversation: data?.conversationWithUser,
    loading,
    error,
    refetch,
  };
};

export default useConversations;
