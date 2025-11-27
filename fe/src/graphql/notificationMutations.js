import { gql } from '@apollo/client';

// =======================================================
// NOTIFICATION MUTATIONS
// =======================================================

/**
 * Mutation to mark a notification as read
 */
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($input: MarkNotificationAsReadInput!) {
    markNotificationAsRead(input: $input) {
      notificationID
      isRead
      readAt
    }
  }
`;

/**
 * Mutation to mark all notifications as read
 */
export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

