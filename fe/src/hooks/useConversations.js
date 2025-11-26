import { useQuery, useApolloClient } from '@apollo/client/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { GET_MY_CONVERSATIONS, GET_CONVERSATION_DETAIL, GET_CONVERSATION_WITH_USER } from '../graphql/messagingQueries';
import { useConversationSubscription } from './useMessageSubscription';

/**
 * Hook for fetching and managing conversations
 * @param {Object} options - Configuration options
 * @param {number} options.page - Page number for pagination (default: 0)
 * @param {number} options.size - Page size for pagination (default: 20)
 * @param {number} options.selectedConversationID - Currently selected conversation ID (for marking as read)
 * @returns {Object} Conversations data and methods
 */
export const useConversations = ({ page = 0, size = 20, selectedConversationID = null } = {}) => {
  const [currentPage, setCurrentPage] = useState(page);
  const [localConversations, setLocalConversations] = useState([]);
  const client = useApolloClient();
  const selectedConversationIDRef = useRef(selectedConversationID);

  // Keep ref updated
  useEffect(() => {
    selectedConversationIDRef.current = selectedConversationID;
  }, [selectedConversationID]);

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_MY_CONVERSATIONS, {
    variables: { page: currentPage, size },
    fetchPolicy: 'cache-first', // Use cache-first to prevent refetch on cache update
    nextFetchPolicy: 'cache-only', // After first fetch, only use cache (subscription will update it)
    notifyOnNetworkStatusChange: true,
  });

  // Update local conversations when query data changes
  useEffect(() => {
    if (data?.myConversations) {
      setLocalConversations(data.myConversations);
    }
  }, [data]);

  // Subscribe to conversation updates
  useConversationSubscription((updatedConversation) => {
    console.log('💬 Conversation updated via subscription:', updatedConversation);
    
    setLocalConversations((prev) => {
      console.log('📋 Current conversations count:', prev.length);
      
      const existingIndex = prev.findIndex(
        (conv) => parseInt(conv.conversationID) === parseInt(updatedConversation.conversationID)
      );

      console.log('🔍 Existing conversation index:', existingIndex);

      // Check if this is the currently selected conversation
      const isCurrentlySelected = selectedConversationIDRef.current && 
        parseInt(selectedConversationIDRef.current) === parseInt(updatedConversation.conversationID);

      // If currently viewing this conversation, don't increase unread count
      const conversationToUpdate = isCurrentlySelected 
        ? { ...updatedConversation, unreadCount: 0 }
        : updatedConversation;

      if (existingIndex >= 0) {
        // Update existing conversation
        console.log('✅ Updating existing conversation at index', existingIndex);
        const updated = [...prev];
        updated[existingIndex] = {
          ...prev[existingIndex],
          ...conversationToUpdate,
        };
        // Sort by lastMessageAt (most recent first)
        const sorted = updated.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });
        console.log('✅ Conversation list updated and sorted');
        return sorted;
      } else {
        // Add new conversation at the top
        console.log('✅ Adding new conversation to list');
        return [conversationToUpdate, ...prev];
      }
    });

    // Update Apollo cache as well
    try {
      const cachedData = client.readQuery({
        query: GET_MY_CONVERSATIONS,
        variables: { page: 0, size },
      });

      if (cachedData) {
        const updatedConversations = cachedData.myConversations.map(conv => {
          if (parseInt(conv.conversationID) === parseInt(updatedConversation.conversationID)) {
            return { ...conv, ...updatedConversation };
          }
          return conv;
        });

        // Check if conversation exists, if not add it
        const exists = cachedData.myConversations.some(
          conv => parseInt(conv.conversationID) === parseInt(updatedConversation.conversationID)
        );

        const finalConversations = exists 
          ? updatedConversations 
          : [updatedConversation, ...updatedConversations];

        // Sort by lastMessageAt
        finalConversations.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });

        client.writeQuery({
          query: GET_MY_CONVERSATIONS,
          variables: { page: 0, size },
          data: { myConversations: finalConversations },
        });
      }
    } catch (e) {
      console.warn('Cache update failed:', e);
    }
  });

  // Mark conversation as read in local state (used by useMarkConversationAsRead)
  const markConversationAsReadLocal = useCallback((conversationID) => {
    setLocalConversations((prev) => 
      prev.map(conv => {
        if (parseInt(conv.conversationID) === parseInt(conversationID)) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      })
    );
  }, []);

  const conversations = localConversations;

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
    markConversationAsReadLocal,
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
