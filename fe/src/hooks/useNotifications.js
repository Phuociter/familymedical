import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../graphql/notificationQueries';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../graphql/notificationMutations';
import { NOTIFICATION_RECEIVED } from '../graphql/notificationSubscriptions';

/**
 * Custom hook for managing notifications
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {object} Notifications data and functions
 */
export const useNotifications = (page = 0, size = 20) => {
  // Query for notifications list
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: { page, size },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  // Query for unread count
  const { data: countData, refetch: refetchCount } = useQuery(
    GET_UNREAD_NOTIFICATION_COUNT,
    { 
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    }
  );

  // Subscription for new notifications
  useSubscription(NOTIFICATION_RECEIVED, {
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData?.data?.notificationReceived) {
        // Refetch notifications and count when new notification arrives
        refetch();
        refetchCount();
      }
    },
    errorPolicy: 'all',
  });

  // Mutation to mark notification as read
  const [markAsReadMutation] = useMutation(MARK_NOTIFICATION_AS_READ, {
    refetchQueries: [GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT],
    awaitRefetchQueries: true,
  });

  // Mutation to mark all as read
  const [markAllAsReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ, {
    refetchQueries: [GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT],
    awaitRefetchQueries: true,
  });

  const markAsRead = async (notificationID) => {
    try {
      // Ensure notificationID is passed as Int (not string)
      const id = typeof notificationID === 'string' 
        ? parseInt(notificationID, 10) 
        : Number(notificationID);
      
      if (isNaN(id)) {
        throw new Error('Invalid notificationID');
      }
      
      await markAsReadMutation({
        variables: { input: { notificationID: id } },
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  return {
    notifications: data?.myNotifications?.notifications || [],
    totalCount: data?.myNotifications?.totalCount || 0,
    hasMore: data?.myNotifications?.hasMore || false,
    unreadCount: countData?.unreadNotificationCount || 0,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  };
};

