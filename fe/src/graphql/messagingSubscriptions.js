import { gql } from '@apollo/client';

// =======================================================
// MESSAGE SUBSCRIPTIONS
// =======================================================

/**
 * Subscription for receiving new messages
 */
export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription MessageReceived {
    messageReceived {
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
 * Subscription for conversation updates
 */
export const CONVERSATION_UPDATED_SUBSCRIPTION = gql`
  subscription ConversationUpdated {
    conversationUpdated {
      conversationID
      doctor {
        userID
        fullName
        avatarUrl
      }
      family {
        familyID
        familyName
        headOfFamily {
          userID
          fullName
          avatarUrl
        }
      }
      lastMessage {
        messageID
        content
        sender {
          userID
          fullName
        }
        createdAt
      }
      lastMessageAt
      unreadCount
      createdAt
    }
  }
`;

/**
 * Subscription for typing indicators
 */
export const TYPING_INDICATOR_SUBSCRIPTION = gql`
  subscription TypingIndicator($conversationID: Int!) {
    typingIndicator(conversationID: $conversationID) {
      conversationID
      user {
        userID
        fullName
        avatarUrl
      }
      isTyping
    }
  }
`;
