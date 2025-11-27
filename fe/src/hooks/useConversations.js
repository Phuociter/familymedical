import { useQuery, useApolloClient } from '@apollo/client/react';
import { useCallback, useEffect, useRef } from 'react';
import { 
  GET_MY_CONVERSATIONS, 
  GET_CONVERSATION_DETAIL, 
  GET_CONVERSATION_WITH_USER 
} from '../graphql/messagingQueries';
import { CONVERSATION_UPDATED_SUBSCRIPTION } from '../graphql/messagingSubscriptions';

/**
 * Hook for fetching and managing conversations
 * Uses subscribeToMore pattern from Apollo Client for real-time updates
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.page - Page number for pagination (default: 0)
 * @param {number} options.size - Page size for pagination (default: 20)
 * @param {number} options.selectedConversationID - Currently selected conversation ID (for marking as read)
 * @returns {Object} Conversations data and methods
 */
export const useConversations = ({ page = 0, size = 20, selectedConversationID = null } = {}) => {
  const client = useApolloClient();
  const selectedConversationIDRef = useRef(selectedConversationID);
  const subscriptionRef = useRef(null);

  // Keep ref updated
  useEffect(() => {
    selectedConversationIDRef.current = selectedConversationID;
  }, [selectedConversationID]);

  const { data, loading, error, refetch, fetchMore, subscribeToMore } = useQuery(
    GET_MY_CONVERSATIONS,
    {
      variables: { page, size },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  // Setup subscription using subscribeToMore
  useEffect(() => {
    if (!subscribeToMore) return;

    // Clean up previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    console.log('📡 Setting up conversation subscription');

    const unsubscribe = subscribeToMore({
      document: CONVERSATION_UPDATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data?.conversationUpdated) {
          return prev;
        }

        const updatedConversation = subscriptionData.data.conversationUpdated;
        const conversationID = parseInt(updatedConversation.conversationID);

        console.log('💬 Conversation update received:', {
          conversationID,
          lastMessageContent: updatedConversation.lastMessage?.content?.substring(0, 30),
        });

        const existingConversations = prev?.myConversations || [];

        // Check if this is the currently selected conversation
        const isCurrentlySelected =
          selectedConversationIDRef.current &&
          parseInt(selectedConversationIDRef.current) === conversationID;

        // If currently viewing this conversation, don't increase unread count
        const conversationToUpdate = isCurrentlySelected
          ? { ...updatedConversation, unreadCount: 0, __typename: 'Conversation' }
          : { ...updatedConversation, __typename: 'Conversation' };

        // Find existing conversation
        const existingIndex = existingConversations.findIndex(
          (conv) => parseInt(conv.conversationID) === conversationID
        );

        let updatedConversations;

        if (existingIndex >= 0) {
          // Update existing conversation
          console.log('✅ Updating existing conversation at index', existingIndex);
          updatedConversations = [...existingConversations];
          updatedConversations[existingIndex] = {
            ...existingConversations[existingIndex],
            ...conversationToUpdate,
          };
        } else {
          // Add new conversation
          console.log('✅ Adding new conversation to list');
          updatedConversations = [conversationToUpdate, ...existingConversations];
        }

        // Sort by lastMessageAt (most recent first)
        updatedConversations.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });

        return {
          myConversations: updatedConversations,
        };
      },
      onError: (error) => {
        console.error('❌ Conversation subscription error:', error);
      },
    });

    subscriptionRef.current = unsubscribe;

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        console.log('🔌 Cleaning up conversation subscription');
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [subscribeToMore]);

  // Mark conversation as read in local cache
  const markConversationAsReadLocal = useCallback(
    (conversationID) => {
      try {
        const cachedData = client.readQuery({
          query: GET_MY_CONVERSATIONS,
          variables: { page, size },
        });

        if (cachedData) {
          const updatedConversations = cachedData.myConversations.map((conv) => {
            if (parseInt(conv.conversationID) === parseInt(conversationID)) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          });

          client.writeQuery({
            query: GET_MY_CONVERSATIONS,
            variables: { page, size },
            data: { myConversations: updatedConversations },
          });
        }
      } catch (e) {
        console.warn('Failed to mark conversation as read in cache:', e);
      }
    },
    [client, page, size]
  );

  const conversations = data?.myConversations || [];

  const loadMore = useCallback(() => {
    return fetchMore({
      variables: { page: Math.ceil(conversations.length / size), size },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        // Avoid duplicates
        const existingIds = new Set(prev.myConversations.map((c) => c.conversationID));
        const newConversations = fetchMoreResult.myConversations.filter(
          (c) => !existingIds.has(c.conversationID)
        );

        return {
          myConversations: [...prev.myConversations, ...newConversations],
        };
      },
    });
  }, [conversations.length, size, fetchMore]);

  const refresh = useCallback(() => {
    return refetch({ page: 0, size });
  }, [refetch, size]);

  return {
    conversations,
    loading,
    error,
    refetch: refresh,
    loadMore,
    hasMore: conversations.length >= size && conversations.length % size === 0,
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
