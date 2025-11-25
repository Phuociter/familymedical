package com.example.famMedical.service;

import com.example.famMedical.Entity.*;
import com.example.famMedical.dto.MessageConnection;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.exception.UnAuthorizedException;
import com.example.famMedical.exception.ValidationException;
import com.example.famMedical.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private DoctorAssignmentRepository doctorAssignmentRepository;

    @Mock
    private MessageAttachmentService messageAttachmentService;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Mock
    private TypingIndicatorService typingIndicatorService;

    @Mock
    private RateLimitService rateLimitService;

    @InjectMocks
    private MessageServiceImpl messageService;

    private User doctor;
    private User familyHead;
    private Family family;
    private Conversation conversation;
    private Message message;

    @BeforeEach
    void setUp() {
        // Setup doctor
        doctor = new User();
        doctor.setUserID(1);
        doctor.setFullName("Dr. Test");
        doctor.setEmail("doctor@test.com");
        doctor.setRole(UserRole.BacSi);

        // Setup family head
        familyHead = new User();
        familyHead.setUserID(2);
        familyHead.setFullName("Family Head");
        familyHead.setEmail("family@test.com");
        familyHead.setRole(UserRole.ChuHo);

        // Setup family
        family = new Family();
        family.setFamilyID(1);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHead);

        // Setup conversation
        conversation = Conversation.builder()
            .conversationID(1L)
            .doctor(doctor)
            .family(family)
            .createdAt(LocalDateTime.now())
            .build();

        // Setup message
        message = Message.builder()
            .messageID(1L)
            .conversation(conversation)
            .sender(doctor)
            .content("Test message")
            .isRead(false)
            .createdAt(LocalDateTime.now())
            .build();
    }

    @Nested
    @DisplayName("Send Message Tests")
    class SendMessageTests {

        @Test
        @DisplayName("Should send message successfully with valid content")
        void sendMessage_WithValidContent_Success() {
            // Arrange
            when(rateLimitService.canSendMessage(anyInt())).thenReturn(true);
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));
            when(messageRepository.save(any(Message.class))).thenReturn(message);

            // Act
            Message result = messageService.sendMessage(1, 2, "Test message", 1L, null);

            // Assert
            assertNotNull(result);
            assertEquals("Test message", result.getContent());
            verify(messageRepository).save(any(Message.class));
            verify(conversationRepository).save(any(Conversation.class));
            verify(rateLimitService).recordMessageSent(1);
        }

        @Test
        @DisplayName("Should reject empty message content")
        void sendMessage_WithEmptyContent_ThrowsValidationException() {
            // Arrange
            when(rateLimitService.canSendMessage(anyInt())).thenReturn(true);
            
            // Act & Assert
            assertThrows(ValidationException.class, () -> 
                messageService.sendMessage(1, 2, "", 1L, null)
            );
        }

        @Test
        @DisplayName("Should reject whitespace-only message content")
        void sendMessage_WithWhitespaceContent_ThrowsValidationException() {
            // Arrange
            when(rateLimitService.canSendMessage(anyInt())).thenReturn(true);
            
            // Act & Assert
            assertThrows(ValidationException.class, () -> 
                messageService.sendMessage(1, 2, "   ", 1L, null)
            );
        }

        @Test
        @DisplayName("Should throw NotFoundException when sender not found")
        void sendMessage_WithInvalidSender_ThrowsNotFoundException() {
            // Arrange
            when(rateLimitService.canSendMessage(anyInt())).thenReturn(true);
            when(userRepository.findById(1)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                messageService.sendMessage(1, 2, "Test", 1L, null)
            );
        }

        @Test
        @DisplayName("Should throw NotFoundException when recipient not found")
        void sendMessage_WithInvalidRecipient_ThrowsNotFoundException() {
            // Arrange
            when(rateLimitService.canSendMessage(anyInt())).thenReturn(true);
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(userRepository.findById(2)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                messageService.sendMessage(1, 2, "Test", 1L, null)
            );
        }
    }

    @Nested
    @DisplayName("Mark Message As Read Tests")
    class MarkMessageAsReadTests {

        @Test
        @DisplayName("Should mark message as read successfully")
        void markMessageAsRead_WithValidMessage_Success() {
            // Arrange
            when(messageRepository.findById(1L)).thenReturn(Optional.of(message));
            when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
            when(messageRepository.save(any(Message.class))).thenReturn(message);

            // Act
            Message result = messageService.markMessageAsRead(1L, 2);

            // Assert
            assertNotNull(result);
            verify(messageRepository).save(any(Message.class));
        }

        @Test
        @DisplayName("Should throw ValidationException when marking own message as read")
        void markMessageAsRead_OwnMessage_ThrowsValidationException() {
            // Arrange
            when(messageRepository.findById(1L)).thenReturn(Optional.of(message));

            // Act & Assert
            assertThrows(ValidationException.class, () -> 
                messageService.markMessageAsRead(1L, 1)
            );
        }

        @Test
        @DisplayName("Should throw NotFoundException when message not found")
        void markMessageAsRead_InvalidMessage_ThrowsNotFoundException() {
            // Arrange
            when(messageRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                messageService.markMessageAsRead(1L, 2)
            );
        }
    }

    @Nested
    @DisplayName("Get Conversation Messages Tests")
    class GetConversationMessagesTests {

        @Test
        @DisplayName("Should get conversation messages with pagination")
        void getConversationMessages_WithValidConversation_Success() {
            // Arrange
            List<Message> messages = List.of(message);
            Page<Message> messagePage = new PageImpl<>(messages);
            
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));
            when(messageRepository.findByConversationID(eq(1L), any(Pageable.class)))
                .thenReturn(messagePage);

            // Act
            MessageConnection result = messageService.getConversationMessages(1L, 0, 10);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getMessages().size());
            assertEquals(1, result.getTotalCount());
            assertFalse(result.isHasMore());
        }

        @Test
        @DisplayName("Should throw NotFoundException when conversation not found")
        void getConversationMessages_InvalidConversation_ThrowsNotFoundException() {
            // Arrange
            when(conversationRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                messageService.getConversationMessages(1L, 0, 10)
            );
        }
    }

    @Nested
    @DisplayName("Get Or Create Conversation Tests")
    class GetOrCreateConversationTests {

        @Test
        @DisplayName("Should return existing conversation")
        void getOrCreateConversation_ExistingConversation_ReturnsExisting() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(familyRepository.findById(1)).thenReturn(Optional.of(family));
            when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                1, 1, DoctorAssignment.AssignmentStatus.ACTIVE))
                .thenReturn(true);
            when(conversationRepository.findByDoctorAndFamily(1, 1))
                .thenReturn(Optional.of(conversation));

            // Act
            Conversation result = messageService.getOrCreateConversation(1, 1);

            // Assert
            assertNotNull(result);
            assertEquals(1L, result.getConversationID());
            verify(conversationRepository, never()).save(any(Conversation.class));
        }

        @Test
        @DisplayName("Should create new conversation when not exists")
        void getOrCreateConversation_NoExistingConversation_CreatesNew() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(familyRepository.findById(1)).thenReturn(Optional.of(family));
            when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                1, 1, DoctorAssignment.AssignmentStatus.ACTIVE))
                .thenReturn(true);
            when(conversationRepository.findByDoctorAndFamily(1, 1))
                .thenReturn(Optional.empty());
            when(conversationRepository.save(any(Conversation.class)))
                .thenReturn(conversation);

            // Act
            Conversation result = messageService.getOrCreateConversation(1, 1);

            // Assert
            assertNotNull(result);
            verify(conversationRepository).save(any(Conversation.class));
        }

        @Test
        @DisplayName("Should throw UnAuthorizedException when no active relationship")
        void getOrCreateConversation_NoActiveRelationship_ThrowsUnAuthorizedException() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(familyRepository.findById(1)).thenReturn(Optional.of(family));
            when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                1, 1, DoctorAssignment.AssignmentStatus.ACTIVE))
                .thenReturn(false);

            // Act & Assert
            assertThrows(UnAuthorizedException.class, () -> 
                messageService.getOrCreateConversation(1, 1)
            );
        }

        @Test
        @DisplayName("Should throw ValidationException when user is not a doctor")
        void getOrCreateConversation_NotDoctor_ThrowsValidationException() {
            // Arrange
            User notDoctor = new User();
            notDoctor.setUserID(3);
            notDoctor.setRole(UserRole.Admin);
            
            when(userRepository.findById(3)).thenReturn(Optional.of(notDoctor));

            // Act & Assert
            assertThrows(ValidationException.class, () -> 
                messageService.getOrCreateConversation(3, 1)
            );
        }
    }

    @Nested
    @DisplayName("Get Unread Message Count Tests")
    class GetUnreadMessageCountTests {

        @Test
        @DisplayName("Should return unread message count")
        void getUnreadMessageCount_WithValidUser_ReturnsCount() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(messageRepository.countUnreadByUser(1)).thenReturn(5);

            // Act
            int result = messageService.getUnreadMessageCount(1);

            // Assert
            assertEquals(5, result);
        }

        @Test
        @DisplayName("Should throw NotFoundException when user not found")
        void getUnreadMessageCount_InvalidUser_ThrowsNotFoundException() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                messageService.getUnreadMessageCount(1)
            );
        }
    }

    @Nested
    @DisplayName("Get User Conversations Tests")
    class GetUserConversationsTests {

        @Test
        @DisplayName("Should return user conversations with pagination")
        void getUserConversations_WithValidUser_ReturnsConversations() {
            // Arrange
            List<Conversation> conversations = List.of(conversation);
            Page<Conversation> conversationPage = new PageImpl<>(conversations);
            
            when(conversationRepository.findByUserID(eq(1), any(Pageable.class)))
                .thenReturn(conversationPage);

            // Act
            List<Conversation> result = messageService.getUserConversations(1, 0, 10);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
        }
    }

    @Nested
    @DisplayName("Mark Conversation As Read Tests")
    class MarkConversationAsReadTests {

        @Test
        @DisplayName("Should mark all messages in conversation as read")
        void markConversationAsRead_WithValidConversation_Success() {
            // Arrange
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));
            when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
            when(messageRepository.markConversationAsRead(eq(1L), eq(2), any(LocalDateTime.class)))
                .thenReturn(3);

            // Act & Assert
            assertDoesNotThrow(() -> 
                messageService.markConversationAsRead(1L, 2)
            );
            verify(messageRepository).markConversationAsRead(eq(1L), eq(2), any(LocalDateTime.class));
        }

        @Test
        @DisplayName("Should throw NotFoundException when conversation not found")
        void markConversationAsRead_InvalidConversation_ThrowsNotFoundException() {
            // Arrange
            when(conversationRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                messageService.markConversationAsRead(1L, 2)
            );
        }
    }

    @Nested
    @DisplayName("Search Messages Tests")
    class SearchMessagesTests {

        @Test
        @DisplayName("Should search messages with keyword")
        void searchMessages_WithKeyword_ReturnsMatchingMessages() {
            // Arrange
            List<Message> messages = List.of(message);
            Page<Message> messagePage = new PageImpl<>(messages);
            
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(messageRepository.searchMessages(eq("test"), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(messagePage);

            // Act
            MessageConnection result = messageService.searchMessages(1, "test", null, null, null, 0, 10);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getMessages().size());
            assertEquals(1, result.getTotalCount());
            verify(messageRepository).searchMessages(eq("test"), isNull(), isNull(), isNull(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search messages with conversation filter")
        void searchMessages_WithConversationFilter_ReturnsFilteredMessages() {
            // Arrange
            List<Message> messages = List.of(message);
            Page<Message> messagePage = new PageImpl<>(messages);
            
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));
            when(messageRepository.searchMessages(eq("test"), eq(1L), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(messagePage);

            // Act
            MessageConnection result = messageService.searchMessages(1, "test", 1L, null, null, 0, 10);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getMessages().size());
            verify(messageRepository).searchMessages(eq("test"), eq(1L), isNull(), isNull(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search messages with date range filter")
        void searchMessages_WithDateRangeFilter_ReturnsFilteredMessages() {
            // Arrange
            LocalDateTime startDate = LocalDateTime.now().minusDays(7);
            LocalDateTime endDate = LocalDateTime.now();
            List<Message> messages = List.of(message);
            Page<Message> messagePage = new PageImpl<>(messages);
            
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(messageRepository.searchMessages(isNull(), isNull(), eq(startDate), eq(endDate), any(Pageable.class)))
                .thenReturn(messagePage);

            // Act
            MessageConnection result = messageService.searchMessages(1, null, null, startDate, endDate, 0, 10);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getMessages().size());
            verify(messageRepository).searchMessages(isNull(), isNull(), eq(startDate), eq(endDate), any(Pageable.class));
        }

        @Test
        @DisplayName("Should throw UnAuthorizedException when user not participant in conversation")
        void searchMessages_NotParticipant_ThrowsUnAuthorizedException() {
            // Arrange
            User otherUser = new User();
            otherUser.setUserID(3);
            otherUser.setRole(UserRole.BacSi);
            
            when(userRepository.findById(3)).thenReturn(Optional.of(otherUser));
            when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));

            // Act & Assert
            assertThrows(UnAuthorizedException.class, () -> 
                messageService.searchMessages(3, "test", 1L, null, null, 0, 10)
            );
        }

        @Test
        @DisplayName("Should throw NotFoundException when user not found")
        void searchMessages_InvalidUser_ThrowsNotFoundException() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                messageService.searchMessages(1, "test", null, null, null, 0, 10)
            );
        }
    }
}
