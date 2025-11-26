import { gql } from '@apollo/client';

// =======================================================
// MESSAGE MUTATIONS
// =======================================================

/**
 * Mutation to send a new message
 */
export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      messageID
      conversation {
        conversationID
      }
      sender {
        userID
        fullName
        avatarUrl
      }
      content
      attachments {
        attachmentID
        filename
        fileType
        fileSize
        fileUrl
        uploadedAt
      }
      isRead
      readAt
      createdAt
    }
  }
`;

/**
 * Mutation to mark a message as read
 */
export const MARK_MESSAGE_AS_READ = gql`
  mutation MarkMessageAsRead($input: MarkMessageAsReadInput!) {
    markMessageAsRead(input: $input) {
      messageID
      isRead
      readAt
    }
  }
`;

/**
 * Mutation to mark all messages in a conversation as read
 */
export const MARK_CONVERSATION_AS_READ = gql`
  mutation MarkConversationAsRead($conversationID: Int!) {
    markConversationAsRead(conversationID: $conversationID)
  }
`;

// =======================================================
// TYPING INDICATOR MUTATION
// =======================================================

/**
 * Mutation to send typing indicator
 */
export const SEND_TYPING_INDICATOR = gql`
  mutation SendTypingIndicator($input: TypingIndicatorInput!) {
    sendTypingIndicator(input: $input)
  }
`;
