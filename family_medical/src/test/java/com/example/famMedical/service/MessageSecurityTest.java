package com.example.famMedical.service;

import com.example.famMedical.Entity.*;
import com.example.famMedical.exception.UnAuthorizedException;
import com.example.famMedical.exception.ValidationException;
import com.example.famMedical.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Security Tests for Message Service
 * Security Tests for Message Service
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Message Security Tests")
class MessageSecurityTest {

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
    private ApplicationEventPublisher eventPublisher;
    
    @Mock
    private TypingIndicatorService typingIndicatorService;
    
    @Mock
    private RateLimitService rateLimitService;
    
    @InjectMocks
    private MessageServiceImpl messageService;
    
    private User doctor;
    private User familyHead;
    private User unauthorizedUser;
    private Family family;
    private Conversation conversation;
    private Message message;
    
    @BeforeEach
    void setUp() {
        // Setup doctor
        doctor = new User();
        doctor.setUserID(1);
        doctor.setFullName("Dr. Test");
        doctor.setRole(UserRole.BacSi);
        
        // Setup family head
        familyHead = new User();
        familyHead.setUserID(2);
        familyHead.setFullName("Family Head");
        familyHead.setRole(UserRole.ChuHo);
        
        // Setup unauthorized user
        unauthorizedUser = new User();
        unauthorizedUser.setUserID(3);
        unauthorizedUser.setFullName("Unauthorized User");
        unauthorizedUser.setRole(UserRole.ChuHo);
        
        // Setup family
        family = new Family();
        family.setFamilyID(1);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHead);
        
        // Setup conversation
        conversation = new Conversation();
        conversation.setConversationID(1);
        conversation.setDoctor(doctor);
        conversation.setFamily(family);
        conversation.setCreatedAt(LocalDateTime.now());
        
        // Setup message
        message = new Message();
        message.setMessageID(1);
        message.setConversation(conversation);
        message.setSender(doctor);
        message.setContent("Test message");
        message.setIsRead(false);
        message.setCreatedAt(LocalDateTime.now());
    }
    
    @Test
    @DisplayName(" 7.2: Should prevent unauthorized user from marking message as read")
    void testUnauthorizedMarkMessageAsRead() {
        // Given
        when(messageRepository.findById(1)).thenReturn(Optional.of(message));
        when(userRepository.findById(3)).thenReturn(Optional.of(unauthorizedUser));
        
        // When & Then
        assertThrows(UnAuthorizedException.class, () -> {
            messageService.markMessageAsRead(1, 3);
        });
        
        verify(messageRepository, never()).save(any(Message.class));
    }
    
    @Test
    @DisplayName(" 7.2: Should prevent user from marking their own message as read")
    void testCannotMarkOwnMessageAsRead() {
        // Given
        when(messageRepository.findById(1)).thenReturn(Optional.of(message));
        
        // When & Then
        assertThrows(ValidationException.class, () -> {
            messageService.markMessageAsRead(1, doctor.getUserID());
        });
        
        verify(messageRepository, never()).save(any(Message.class));
    }
    
    @Test
    @DisplayName(" 7.2: Should allow authorized participant to mark message as read")
    void testAuthorizedMarkMessageAsRead() {
        // Given
        when(messageRepository.findById(1)).thenReturn(Optional.of(message));
        when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
        when(messageRepository.save(any(Message.class))).thenReturn(message);
        
        // When
        Message result = messageService.markMessageAsRead(1, familyHead.getUserID());
        
        // Then
        assertNotNull(result);
        verify(messageRepository).save(any(Message.class));
    }
    
    @Test
    @DisplayName(" 7.2: Should prevent unauthorized user from accessing conversation")
    void testUnauthorizedConversationAccess() {
        // Given
        when(conversationRepository.findById(1)).thenReturn(Optional.of(conversation));
        when(userRepository.findById(3)).thenReturn(Optional.of(unauthorizedUser));
        
        // When & Then
        assertThrows(UnAuthorizedException.class, () -> {
            messageService.markConversationAsRead(1, 3);
        });
        
        verify(messageRepository, never()).markConversationAsRead(anyInt(), anyInt(), any());
    }
    
    @Test
    @DisplayName(" 7.5: Should prevent messaging without doctor-family relationship")
    void testMessagingWithoutRelationship() {
        // Given
        when(rateLimitService.canSendMessage(anyInt())).thenReturn(true);
        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
        when(familyRepository.findAll()).thenReturn(java.util.List.of(family));
        
        // No active relationship
        when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
            anyInt(), anyInt(), any()
        )).thenReturn(false);
        
        // When & Then
        assertThrows(UnAuthorizedException.class, () -> {
            messageService.sendMessage(
                doctor.getUserID(),
                familyHead.getUserID(),
                "Test message",
                null,
                null
            );
        });
        
        verify(messageRepository, never()).save(any(Message.class));
    }
    
    @Test
    @DisplayName(" 7.5: Should allow messaging with active doctor-family relationship")
    void testMessagingWithActiveRelationship() {
        // Given
        when(rateLimitService.canSendMessage(anyInt())).thenReturn(true);
        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
        when(familyRepository.findAll()).thenReturn(java.util.List.of(family));
        when(familyRepository.findById(1)).thenReturn(Optional.of(family));
        
        // Active relationship exists
        when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
            1, 1, DoctorAssignment.AssignmentStatus.ACTIVE
        )).thenReturn(true);
        
        when(conversationRepository.findByDoctorAndFamily(1, 1))
            .thenReturn(Optional.of(conversation));
        
        Message savedMessage = new Message();
        savedMessage.setMessageID(1);
        savedMessage.setContent("Test message");
        savedMessage.setConversation(conversation);
        savedMessage.setSender(doctor);
        savedMessage.setCreatedAt(LocalDateTime.now());
        
        when(messageRepository.save(any(Message.class))).thenReturn(savedMessage);
        when(conversationRepository.save(any(Conversation.class))).thenReturn(conversation);
        
        // When
        Message result = messageService.sendMessage(
            doctor.getUserID(),
            familyHead.getUserID(),
            "Test message",
            null,
            null
        );
        
        // Then
        assertNotNull(result);
        verify(messageRepository).save(any(Message.class));
        verify(rateLimitService).recordMessageSent(doctor.getUserID());
    }
    
    @Test
    @DisplayName("Rate Limiting: Should prevent sending messages too quickly")
    void testRateLimiting() {
        // Given
        when(rateLimitService.canSendMessage(anyInt())).thenReturn(false);
        
        // When & Then
        assertThrows(ValidationException.class, () -> {
            messageService.sendMessage(
                doctor.getUserID(),
                familyHead.getUserID(),
                "Test message",
                null,
                null
            );
        });
        
        verify(messageRepository, never()).save(any(Message.class));
    }
    
    @Test
    @DisplayName(" 7.2: Should prevent unauthorized typing indicator")
    void testUnauthorizedTypingIndicator() {
        // Given
        when(conversationRepository.findById(1)).thenReturn(Optional.of(conversation));
        when(userRepository.findById(3)).thenReturn(Optional.of(unauthorizedUser));
        
        // When & Then
        assertThrows(UnAuthorizedException.class, () -> {
            messageService.sendTypingIndicator(1, 3, true);
        });
        
        verify(typingIndicatorService, never()).sendTypingIndicator(anyInt(), any(), anyBoolean());
    }
    
    @Test
    @DisplayName(" 7.1: Should reject empty message content")
    void testEmptyMessageRejection() {
        // Given
        when(rateLimitService.canSendMessage(anyInt())).thenReturn(true);
        
        // When & Then - empty string
        assertThrows(ValidationException.class, () -> {
            messageService.sendMessage(
                doctor.getUserID(),
                familyHead.getUserID(),
                "",
                null,
                null
            );
        });
        
        // When & Then - whitespace only
        assertThrows(ValidationException.class, () -> {
            messageService.sendMessage(
                doctor.getUserID(),
                familyHead.getUserID(),
                "   ",
                null,
                null
            );
        });
        
        verify(messageRepository, never()).save(any(Message.class));
    }
}
