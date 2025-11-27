import { gql } from '@apollo/client';

// =======================================================
// NOTIFICATION SUBSCRIPTIONS
// =======================================================

/**
 * Subscription to receive new notifications in realtime
 */
export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived {
    notificationReceived {
      notificationID
      type
      title
      message
      relatedEntityType
      relatedEntityID
      isRead
      readAt
      createdAt
      user {
        userID
        fullName
      }
    }
  }
`;

