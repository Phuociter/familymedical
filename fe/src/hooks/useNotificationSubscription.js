/**
 * Custom hook for notification subscriptions
 * 
 * This hook demonstrates how to use GraphQL subscriptions for real-time notifications.
 */

import { useSubscription, gql } from '@apollo/client/react';
import { useEffect } from 'react';
import { createSubscriptionOptions } from '../utils/subscriptionUtils';

// GraphQL subscription for receiving new notifications
const NOTIFICATION_RECEIVED_SUBSCRIPTION = gql`
  subscription NotificationReceived {
    notificationReceived {
      notificationID
      user {
        userID
        fullName
      }
      type
      title
      message
      relatedEntityType
      relatedEntityID
      isRead
      createdAt
    }
  }
`;

/**
 * Hook for subscribing to new notifications
 * @param {Function} onNewNotification - Callback when a new notification is received
 * @returns {Object} Subscription state { notification, loading, error }
 */
export const useNotificationSubscription = (onNewNotification) => {
  const { data, loading, error } = useSubscription(
    NOTIFICATION_RECEIVED_SUBSCRIPTION,
    createSubscriptionOptions({
      subscriptionName: 'NotificationReceived',
      onData: (data) => {
        if (data.notificationReceived && onNewNotification) {
          onNewNotification(data.notificationReceived);
        }
      },
    })
  );

  useEffect(() => {
    if (error) {
      console.error('Notification subscription error:', error);
    }
  }, [error]);

  return {
    notification: data?.notificationReceived,
    loading,
    error,
  };
};

export default useNotificationSubscription;
