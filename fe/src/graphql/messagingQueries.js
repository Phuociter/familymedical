import { gql } from '@apollo/client';

// =======================================================
// CONVERSATION QUERIES
// =======================================================

/**
 * Query to get all conversations for the current user
 */
export const GET_MY_CONVERSATIONS = gql`
  query GetMyConversations($page: Int, $size: Int) {
    myConversations(page: $page, size: $size) {
      conversationID
      doctor {
        userID
        fullName
        avatarUrl
        email
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
 * Query to get a specific conversation by ID
 */
export const GET_CONVERSATION_DETAIL = gql`
  query GetConversationDetail($conversationID: Int!) {
    conversationDetail(conversationID: $conversationID) {
      conversationID
      doctor {
        userID
        fullName
        avatarUrl
        email
        phoneNumber
      }
      family {
        familyID
        familyName
        familyAddress
        headOfFamily {
          userID
          fullName
          avatarUrl
          phoneNumber
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
 * Query to get or create a conversation with a specific user
 */
export const GET_CONVERSATION_WITH_USER = gql`
  query GetConversationWithUser($otherUserID: Int!) {
    conversationWithUser(otherUserID: $otherUserID) {
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

// =======================================================
// MESSAGE QUERIES
// =======================================================

/**
 * Query to get messages for a specific conversation
 */
export const GET_CONVERSATION_MESSAGES = gql`
  query GetConversationMessages($conversationID: Int!, $page: Int, $size: Int) {
    conversationMessages(conversationID: $conversationID, page: $page, size: $size) {
      messages {
        messageID
        conversation {
          conversationID
        }
        sender {
          userID
          fullName
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
      totalCount
      hasMore
    }
  }
`;

/**
 * Query to search messages
 */
export const SEARCH_MESSAGES = gql`
  query SearchMessages($input: MessageSearchInput!) {
    searchMessages(input: $input) {
      messages {
        messageID
        conversation {
          conversationID
          doctor {
            userID
            fullName
          }
          family {
            familyID
            familyName
          }
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
          fileUrl
        }
        isRead
        createdAt
      }
      totalCount
      hasMore
    }
  }
`;

/**
 * Query to get unread message count
 */
export const GET_UNREAD_MESSAGE_COUNT = gql`
  query GetUnreadMessageCount {
    unreadMessageCount
  }
`;
