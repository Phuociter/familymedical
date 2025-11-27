# Messaging UI Components

This directory contains the frontend UI components for the realtime messaging feature.

## Components Overview

### ConversationList
Displays a list of all conversations with search functionality and unread message badges.

**Props:**
- `conversations` (array): Array of conversation objects
- `selectedConversation` (object): Currently selected conversation
- `onSelectConversation` (function): Callback when a conversation is selected
- `loading` (boolean): Loading state
- `currentUserRole` (string): 'DOCTOR' or 'FAMILY'

**Features:**
- Search conversations by participant name
- Display unread message count badges
- Sort conversations by most recent message
- Show last message preview
- Relative timestamp formatting

**Requirements:** 2.1, 2.3, 2.4

---

### ConversationView
Displays messages in a conversation with message input and typing indicators.

**Props:**
- `conversation` (object): Current conversation object
- `messages` (array): Array of message objects
- `currentUserId` (number): Current user's ID
- `currentUserRole` (string): 'DOCTOR' or 'FAMILY'
- `loading` (boolean): Loading state
- `hasMore` (boolean): Whether more messages can be loaded
- `sending` (boolean): Whether a message is being sent
- `typingUser` (object): User who is currently typing
- `onSendMessage` (function): Callback to send a message
- `onLoadMore` (function): Callback to load more messages
- `onTypingStart` (function): Callback when user starts typing
- `onTypingStop` (function): Callback when user stops typing
- `onBack` (function): Callback for back navigation (mobile)
- `onViewProfile` (function): Callback to view other party's profile
- `onCreateAppointment` (function): Callback to create appointment
- `onViewMedicalRecords` (function): Callback to view medical records

**Features:**
- Display messages in chronological order
- Auto-scroll to bottom on new messages
- Load more messages on scroll to top
- Show typing indicators
- Context menu with actions
- Mobile-responsive back button

**Requirements:** 1.1, 1.2, 2.1, 9.1, 10.4

---

### MessageBubble
Displays a single message with sender info, content, timestamp, and attachments.

**Props:**
- `message` (object): Message object with content, sender, attachments, etc.
- `currentUserId` (number): Current user's ID to determine message alignment

**Features:**
- Different styling for sent vs received messages
- Display sender name and avatar
- Show message content with proper formatting
- Display file attachments with download links
- Show read status for sent messages
- Timestamp formatting

**Requirements:** 1.1, 1.2, 9.3

---

### MessageInput
Input component for composing and sending messages with file attachments.

**Props:**
- `onSendMessage` (function): Callback to send message (text, attachments)
- `onTypingStart` (function): Callback when user starts typing
- `onTypingStop` (function): Callback when user stops typing
- `disabled` (boolean): Whether input is disabled
- `sending` (boolean): Whether a message is being sent

**Features:**
- Multi-line text input
- File attachment support with validation
- File size validation (max 10MB)
- File type validation (images, PDF, Word docs)
- Attachment preview with remove option
- Send on Enter key (Shift+Enter for new line)
- Typing indicator triggers
- Error message display

**Requirements:** 1.1, 1.2, 9.1

---

### TypingIndicator
Shows an animated indicator when the other user is typing.

**Props:**
- `userName` (string): Name of the user who is typing

**Features:**
- Animated dots
- User name display
- Smooth animations

**Requirements:** 10.4

---

## Usage Example

```jsx
import { 
  ConversationList, 
  ConversationView 
} from './components/Messaging';

function MessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const handleSendMessage = async (text, attachments) => {
    // Send message via GraphQL mutation
    await sendMessageMutation({
      variables: {
        input: {
          conversationID: selectedConversation.conversationID,
          recipientID: otherPartyId,
          content: text,
          attachments: attachments,
        }
      }
    });
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        currentUserRole="DOCTOR"
      />
      <ConversationView
        conversation={selectedConversation}
        messages={messages}
        currentUserId={currentUser.userID}
        currentUserRole="DOCTOR"
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
}
```

## Data Structure

### Conversation Object
```javascript
{
  conversationID: number,
  doctor: {
    userID: number,
    fullName: string,
    // ... other user fields
  },
  family: {
    familyID: number,
    familyName: string,
    // ... other family fields
  },
  lastMessage: Message,
  lastMessageAt: string (ISO timestamp),
  unreadCount: number,
  createdAt: string (ISO timestamp)
}
```

### Message Object
```javascript
{
  messageID: number,
  conversation: Conversation,
  sender: {
    userID: number,
    fullName: string,
    // ... other user fields
  },
  content: string,
  attachments: [
    {
      attachmentID: number,
      filename: string,
      fileType: string,
      fileSize: number,
      fileUrl: string,
      uploadedAt: string (ISO timestamp)
    }
  ],
  isRead: boolean,
  readAt: string (ISO timestamp) | null,
  createdAt: string (ISO timestamp)
}
```

## Styling

All components use Material-UI (MUI) components and follow the doctor theme defined in `fe/src/theme/doctorTheme.js`. The components are fully responsive and work on mobile, tablet, and desktop screens.

## Accessibility

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes

## Performance Considerations

- Messages are paginated to avoid loading too many at once
- Virtualization can be added for very long conversation lists
- File uploads are validated before sending to server
- Optimistic UI updates for better perceived performance

## Future Enhancements

- Message reactions (emoji)
- Message editing and deletion
- Voice messages
- Image preview in chat
- Message search within conversation
- Message forwarding
- Conversation archiving
