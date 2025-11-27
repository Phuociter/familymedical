# Messaging Hooks Documentation

This directory contains custom React hooks for implementing real-time messaging functionality using GraphQL queries, mutations, and subscriptions.

## Overview

The messaging system provides:
- Real-time message delivery via GraphQL subscriptions
- Conversation management
- Message pagination and search
- File attachment support
- Typing indicators
- Read status tracking

## Hooks

### 1. useConversations

Manages conversation list and individual conversation details.

```javascript
import { useConversations } from '../hooks/messaging';

function ConversationList() {
  const { conversations, loading, error, refetch, loadMore, hasMore } = useConversations({
    page: 0,
    size: 20
  });

  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.conversationID}>
          {conv.family.familyName} - {conv.unreadCount} unread
        </div>
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

**Options:**
- `page` (number): Page number for pagination (default: 0)
- `size` (number): Page size (default: 20)

**Returns:**
- `conversations` (array): List of conversations
- `loading` (boolean): Loading state
- `error` (object): Error object if any
- `refetch` (function): Refresh conversations
- `loadMore` (function): Load next page
- `hasMore` (boolean): Whether more conversations are available

### 2. useConversationDetail

Fetches details for a specific conversation.

```javascript
import { useConversationDetail } from '../hooks/messaging';

function ConversationHeader({ conversationID }) {
  const { conversation, loading, error, refetch } = useConversationDetail(conversationID);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{conversation.family.familyName}</h2>
      <p>Unread: {conversation.unreadCount}</p>
    </div>
  );
}
```

### 3. useMessages

Manages messages within a conversation with pagination.

```javascript
import { useMessages } from '../hooks/messaging';

function MessageList({ conversationID }) {
  const { 
    messages, 
    totalCount, 
    hasMore, 
    loading, 
    loadMore, 
    addMessage 
  } = useMessages(conversationID, { page: 0, size: 50 });

  return (
    <div>
      {hasMore && <button onClick={loadMore}>Load Older Messages</button>}
      {messages.map(msg => (
        <div key={msg.messageID}>
          <strong>{msg.sender.fullName}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
}
```

**Options:**
- `page` (number): Page number (default: 0)
- `size` (number): Page size (default: 50)

**Returns:**
- `messages` (array): List of messages
- `totalCount` (number): Total message count
- `hasMore` (boolean): Whether more messages are available
- `loading` (boolean): Loading state
- `error` (object): Error object
- `refetch` (function): Refresh messages
- `loadMore` (function): Load more messages
- `addMessage` (function): Add a new message to the list

### 4. useSendMessage

Sends messages with optional file attachments.

```javascript
import { useSendMessage } from '../hooks/messaging';

function MessageInput({ conversationID, recipientID }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  
  const { sendMessage, loading, error, uploadProgress } = useSendMessage({
    onCompleted: (message) => {
      console.log('Message sent:', message);
      setContent('');
      setFiles([]);
    },
    onError: (error) => {
      console.error('Failed to send:', error);
    }
  });

  const handleSend = async () => {
    try {
      await sendMessage({
        conversationID,
        recipientID,
        content,
        attachments: files
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
      />
      <input 
        type="file" 
        multiple 
        onChange={(e) => setFiles(Array.from(e.target.files))} 
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? `Sending... ${uploadProgress}%` : 'Send'}
      </button>
    </div>
  );
}
```

**Options:**
- `onCompleted` (function): Callback when message is sent
- `onError` (function): Callback on error

**Returns:**
- `sendMessage` (function): Function to send a message
- `loading` (boolean): Sending state
- `error` (object): Error object
- `uploadProgress` (number): Upload progress percentage
- `sentMessage` (object): The sent message object

### 5. useMessageSubscription

Subscribes to real-time message updates.

```javascript
import { useMessageSubscription } from '../hooks/messaging';

function MessageContainer({ conversationID }) {
  const { messages, addMessage } = useMessages(conversationID);
  
  useMessageSubscription((newMessage) => {
    if (newMessage.conversation.conversationID === conversationID) {
      addMessage(newMessage);
    }
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.messageID}>{msg.content}</div>
      ))}
    </div>
  );
}
```

**Parameters:**
- `onNewMessage` (function): Callback when a new message is received

**Returns:**
- `message` (object): Latest received message
- `loading` (boolean): Subscription loading state
- `error` (object): Error object

### 6. useConversationSubscription

Subscribes to conversation updates (e.g., new messages, unread count changes).

```javascript
import { useConversationSubscription } from '../hooks/messaging';

function ConversationList() {
  const { conversations, refetch } = useConversations();
  
  useConversationSubscription((updatedConversation) => {
    // Refresh conversation list when any conversation updates
    refetch();
  });

  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.conversationID}>
          {conv.family.familyName} - {conv.unreadCount} unread
        </div>
      ))}
    </div>
  );
}
```

### 7. useTypingIndicator

Manages typing indicators in a conversation.

```javascript
import { useTypingIndicator } from '../hooks/messaging';

function MessageInput({ conversationID }) {
  const [content, setContent] = useState('');
  
  const { 
    handleTyping, 
    handleMessageSent, 
    isOtherUserTyping,
    typingUser 
  } = useTypingIndicator(conversationID, (indicator) => {
    console.log('Typing status:', indicator);
  });

  const handleChange = (e) => {
    setContent(e.target.value);
    handleTyping(); // Call on every keystroke
  };

  const handleSend = async () => {
    await sendMessage({ conversationID, content });
    handleMessageSent(); // Call after sending
    setContent('');
  };

  return (
    <div>
      {isOtherUserTyping && (
        <div>{typingUser.user.fullName} is typing...</div>
      )}
      <input value={content} onChange={handleChange} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

**Parameters:**
- `conversationID` (number): The conversation ID
- `onTypingChange` (function): Callback when typing status changes

**Returns:**
- `startTyping` (function): Start typing indicator
- `stopTyping` (function): Stop typing indicator
- `handleTyping` (function): Call on keystroke
- `handleMessageSent` (function): Call after sending message
- `typingUser` (object): User who is typing
- `isOtherUserTyping` (boolean): Whether other user is typing

### 8. useMessageSearch

Searches messages with filters.

```javascript
import { useMessageSearch } from '../hooks/messaging';

function MessageSearch() {
  const [keyword, setKeyword] = useState('');
  
  const { messages, totalCount, loading } = useMessageSearch({
    keyword,
    page: 0,
    size: 20
  });

  return (
    <div>
      <input 
        value={keyword} 
        onChange={(e) => setKeyword(e.target.value)} 
        placeholder="Search messages..."
      />
      <div>Found {totalCount} messages</div>
      {messages.map(msg => (
        <div key={msg.messageID}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### 9. useUnreadMessageCount

Gets the total unread message count.

```javascript
import { useUnreadMessageCount } from '../hooks/messaging';

function UnreadBadge() {
  const { unreadCount, loading } = useUnreadMessageCount();

  if (loading || unreadCount === 0) return null;

  return <span className="badge">{unreadCount}</span>;
}
```

### 10. useMarkMessageAsRead & useMarkConversationAsRead

Marks messages or conversations as read.

```javascript
import { useMarkMessageAsRead, useMarkConversationAsRead } from '../hooks/messaging';

function MessageActions({ messageID, conversationID }) {
  const { markAsRead } = useMarkMessageAsRead();
  const { markConversationAsRead } = useMarkConversationAsRead();

  return (
    <div>
      <button onClick={() => markAsRead(messageID)}>
        Mark Message as Read
      </button>
      <button onClick={() => markConversationAsRead(conversationID)}>
        Mark All as Read
      </button>
    </div>
  );
}
```

## Complete Example

Here's a complete example combining multiple hooks:

```javascript
import React, { useState } from 'react';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMessageSubscription,
  useTypingIndicator,
  useMarkConversationAsRead
} from '../hooks/messaging';

function MessagingApp() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageContent, setMessageContent] = useState('');

  // Fetch conversations
  const { conversations, loading: conversationsLoading } = useConversations();

  // Fetch messages for selected conversation
  const { 
    messages, 
    addMessage, 
    loading: messagesLoading 
  } = useMessages(selectedConversation?.conversationID);

  // Send message hook
  const { sendMessage, loading: sending } = useSendMessage({
    onCompleted: (message) => {
      setMessageContent('');
      addMessage(message);
    }
  });

  // Typing indicator
  const { 
    handleTyping, 
    handleMessageSent, 
    isOtherUserTyping 
  } = useTypingIndicator(selectedConversation?.conversationID);

  // Mark as read
  const { markConversationAsRead } = useMarkConversationAsRead();

  // Subscribe to new messages
  useMessageSubscription((newMessage) => {
    if (newMessage.conversation.conversationID === selectedConversation?.conversationID) {
      addMessage(newMessage);
    }
  });

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    markConversationAsRead(conversation.conversationID);
  };

  const handleSend = async () => {
    if (!messageContent.trim()) return;
    
    await sendMessage({
      conversationID: selectedConversation.conversationID,
      recipientID: selectedConversation.doctor.userID,
      content: messageContent
    });
    
    handleMessageSent();
  };

  return (
    <div className="messaging-app">
      {/* Conversation List */}
      <div className="conversations">
        {conversations.map(conv => (
          <div 
            key={conv.conversationID}
            onClick={() => handleSelectConversation(conv)}
            className={selectedConversation?.conversationID === conv.conversationID ? 'active' : ''}
          >
            <h4>{conv.family.familyName}</h4>
            {conv.unreadCount > 0 && (
              <span className="badge">{conv.unreadCount}</span>
            )}
          </div>
        ))}
      </div>

      {/* Message Area */}
      {selectedConversation && (
        <div className="messages">
          <div className="message-list">
            {messages.map(msg => (
              <div key={msg.messageID} className="message">
                <strong>{msg.sender.fullName}:</strong> {msg.content}
              </div>
            ))}
          </div>

          {isOtherUserTyping && (
            <div className="typing-indicator">Typing...</div>
          )}

          <div className="message-input">
            <input
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
            />
            <button onClick={handleSend} disabled={sending}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagingApp;
```

## Error Handling

All hooks include error handling. Always check the `error` property:

```javascript
const { messages, loading, error } = useMessages(conversationID);

if (error) {
  console.error('Error loading messages:', error);
  return <div>Failed to load messages: {error.message}</div>;
}
```

## Performance Considerations

1. **Pagination**: Use pagination for large message lists
2. **Caching**: Apollo Client automatically caches queries
3. **Subscriptions**: Subscriptions automatically reconnect on connection loss
4. **Typing Indicators**: Automatically stop after 3 seconds of inactivity

## Requirements Validation

This implementation satisfies the following requirements:

- **1.1, 1.2**: Message sending and receiving (useSendMessage, useMessageSubscription)
- **1.5**: Message history retrieval (useMessages)
- **2.1**: Conversation list (useConversations)
- **4.2, 4.5**: Real-time delivery via subscriptions (useMessageSubscription, useConversationSubscription)
- **10.1, 10.2**: Typing indicators (useTypingIndicator)
