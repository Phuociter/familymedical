import { gql } from '@apollo/client';

// =======================================================
// NOTIFICATION QUERIES
// =======================================================

/**
 * Query to get all notifications for the current user with pagination
 */
export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($page: Int, $size: Int) {
    myNotifications(page: $page, size: $size) {
      notifications {
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
      totalCount
      hasMore
    }
  }
`;

/**
 * Query to get unread notification count
 */
export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

