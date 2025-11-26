package com.example.famMedical.service;

import com.example.famMedical.Entity.*;
import com.example.famMedical.dto.MessageConnection;
import com.example.famMedical.dto.events.NewMessageEvent;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.exception.UnAuthorizedException;
import com.example.famMedical.exception.ValidationException;
import com.example.famMedical.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final DoctorAssignmentRepository doctorAssignmentRepository;
    private final MessageAttachmentService messageAttachmentService;
    private final ApplicationEventPublisher eventPublisher;
    private final TypingIndicatorService typingIndicatorService;
    private final RateLimitService rateLimitService;

    @Override
    @Transactional
    public Message sendMessage(Integer senderID, Integer recipientID, String content,
                              Integer conversationID, List<MultipartFile> attachments) {
        log.info("Sending message from user {} to user {}", senderID, recipientID);
        
        // Check rate limiting (Optional security feature)
        if (!rateLimitService.canSendMessage(senderID)) {
            log.warn("Rate limit exceeded for user {}", senderID);
            throw new ValidationException("You are sending messages too quickly. Please wait a moment.");
        }
        
        // Validate message content
        if (content == null || content.trim().isEmpty()) {
            throw new ValidationException("Message content cannot be empty");
        }
        
        // Get sender
        User sender = userRepository.findById(senderID)
            .orElseThrow(() -> new NotFoundException("Sender user not found"));
        
        // Get recipient
        User recipient = userRepository.findById(recipientID)
            .orElseThrow(() -> new NotFoundException("Recipient user not found"));
        
        // Get or create conversation
        Conversation conversation;
        if (conversationID != null) {
            conversation = conversationRepository.findById(conversationID)
                .orElseThrow(() -> new NotFoundException("Conversation not found"));
            
            // Verify sender is a participant in the existing conversation
            if (!isParticipant(sender, conversation)) {
                throw new UnAuthorizedException("You do not have permission to send messages in this conversation");
            }
            
            // Verify recipient is also a participant
            if (!isParticipant(recipient, conversation)) {
                throw new UnAuthorizedException("Recipient is not a participant in this conversation");
            }
        } else {
            // Determine doctor and family based on roles and verify relationship
            conversation = determineAndCreateConversation(sender, recipient);
        }
        
        // Additional security check: Verify sender is a participant in the conversation
        if (!isParticipant(sender, conversation)) {
            throw new UnAuthorizedException("You do not have permission to send messages in this conversation");
        }
        
        // Create message
        Message message = Message.builder()
            .conversation(conversation)
            .sender(sender)
            .content(content.trim())
            .isRead(false)
            .createdAt(LocalDateTime.now())
            .build();
        
        // Save message
        message = messageRepository.save(message);
        
        // Process attachments if provided
        if (attachments != null && !attachments.isEmpty()) {
            try {
                List<MessageAttachment> processedAttachments = 
                    messageAttachmentService.processAttachments(message, attachments);
                message.setAttachments(processedAttachments);
                log.info("Processed {} attachments for message {}", processedAttachments.size(), message.getMessageID());
            } catch (Exception e) {
                log.error("Failed to process attachments for message {}: {}", message.getMessageID(), e.getMessage());
                // Delete the message if attachment processing fails
                messageRepository.delete(message);
                throw new ValidationException("Failed to upload attachments: " + e.getMessage());
            }
        }
        
        // Update conversation last message timestamp
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);
        
        // Record message sent for rate limiting
        rateLimitService.recordMessageSent(senderID);
        
        // Stop typing indicator when message is sent
        typingIndicatorService.stopTyping(conversation.getConversationID(), sender);
        
        // Publish event for notification
        eventPublisher.publishEvent(new NewMessageEvent(this, message));
        
        log.info("Message {} created successfully by user {}", message.getMessageID(), senderID);
        return message;
    }

    @Override
    @Transactional
    public Message markMessageAsRead(Integer messageID, Integer userID) {
        log.info("Marking message {} as read by user {}", messageID, userID);
        
        Message message = messageRepository.findById(messageID)
            .orElseThrow(() -> new NotFoundException("Message not found"));
        
        // Verify user is the recipient (not the sender)
        if (message.getSender().getUserID().equals(userID)) {
            log.warn("User {} attempted to mark their own message {} as read", userID, messageID);
            throw new ValidationException("Cannot mark your own message as read");
        }
        
        // Verify user is a participant in the conversation
        User user = userRepository.findById(userID)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        if (!isParticipant(user, message.getConversation())) {
            log.warn("Unauthorized access attempt: User {} tried to mark message {} as read", userID, messageID);
            throw new UnAuthorizedException("You do not have permission to access this message");
        }
        
        // Mark as read
        if (!message.getIsRead()) {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            message = messageRepository.save(message);
            log.info("Message {} marked as read", messageID);
        }
        
        return message;
    }

    @Override
    @Transactional
    public void markConversationAsRead(Integer conversationID, Integer userID) {
        log.info("Marking all messages in conversation {} as read by user {}", conversationID, userID);
        
        Conversation conversation = conversationRepository.findById(conversationID)
            .orElseThrow(() -> new NotFoundException("Conversation not found"));
        
        // Verify user is a participant
        User user = userRepository.findById(userID)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        if (!isParticipant(user, conversation)) {
            log.warn("Unauthorized access attempt: User {} tried to mark conversation {} as read", 
                    userID, conversationID);
            throw new UnAuthorizedException("You do not have permission to access this conversation");
        }
        
        // Mark all unread messages as read
        int updatedCount = messageRepository.markConversationAsRead(
            conversationID, userID, LocalDateTime.now()
        );
        
        log.info("Marked {} messages as read in conversation {}", updatedCount, conversationID);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Conversation> getUserConversations(Integer userID, int page, int size) {
        log.info("Getting conversations for user {} (page: {}, size: {})", userID, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("lastMessageAt").descending());
        Page<Conversation> conversationPage = conversationRepository.findByUserID(userID, pageable);
        
        return conversationPage.getContent();
    }

    @Override
    @Transactional
    public Conversation getOrCreateConversation(Integer doctorID, Integer familyID) {
        log.info("Getting or creating conversation between doctor {} and family {}", doctorID, familyID);
        
        // Verify doctor exists and has BacSi role
        User doctor = userRepository.findById(doctorID)
            .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        if (doctor.getRole() != UserRole.BacSi) {
            log.warn("User {} is not a doctor but attempted to create doctor conversation", doctorID);
            throw new ValidationException("User is not a doctor");
        }
        
        // Verify family exists
        Family family = familyRepository.findById(familyID)
            .orElseThrow(() -> new NotFoundException("Family not found"));
        
        // Verify doctor-family relationship exists and is active
        boolean hasActiveRelationship = doctorAssignmentRepository
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctorID, familyID, DoctorAssignment.AssignmentStatus.ACTIVE
            );
        
        if (!hasActiveRelationship) {
            log.warn("Unauthorized conversation attempt: No active relationship between doctor {} and family {}", 
                    doctorID, familyID);
            throw new UnAuthorizedException("No approved relationship exists between doctor and family");
        }
        
        // Try to find existing conversation
        return conversationRepository.findByDoctorAndFamily(doctorID, familyID)
            .orElseGet(() -> {
                // Create new conversation
                Conversation newConversation = Conversation.builder()
                    .doctor(doctor)
                    .family(family)
                    .createdAt(LocalDateTime.now())
                    .build();
                
                Conversation saved = conversationRepository.save(newConversation);
                log.info("Created new conversation {}", saved.getConversationID());
                return saved;
            });
    }

    @Override
    @Transactional(readOnly = true)
    public MessageConnection getConversationMessages(Integer conversationID, int page, int size) {
        log.info("Getting messages for conversation {} (page: {}, size: {})", conversationID, page, size);
        
        // Verify conversation exists
        conversationRepository.findById(conversationID)
            .orElseThrow(() -> new NotFoundException("Conversation not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messagePage = messageRepository.findByConversationID(conversationID, pageable);
        
        return new MessageConnection(
            messagePage.getContent(),
            messagePage.getTotalElements(),
            messagePage.hasNext()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public MessageConnection searchMessages(Integer userID, String keyword, Integer conversationID,
                                           LocalDateTime startDate, LocalDateTime endDate,
                                           int page, int size) {
        log.info("Searching messages for user {} with keyword: {}", userID, keyword);
        
        // Verify user exists
        User user = userRepository.findById(userID)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        // If searching within a specific conversation, verify user is a participant
        if (conversationID != null) {
            Conversation conversation = conversationRepository.findById(conversationID)
                .orElseThrow(() -> new NotFoundException("Conversation not found"));
            
            if (!isParticipant(user, conversation)) {
                throw new UnAuthorizedException("You do not have permission to search messages in this conversation");
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messagePage = messageRepository.searchMessages(
            keyword, conversationID, startDate, endDate, pageable
        );
        
        // Filter messages to only include conversations where user is a participant
        List<Message> filteredMessages = messagePage.getContent().stream()
            .filter(message -> isParticipant(user, message.getConversation()))
            .toList();
        
        log.info("Search returned {} messages for user {} after access control filtering", 
                filteredMessages.size(), userID);
        
        return new MessageConnection(
            filteredMessages,
            messagePage.getTotalElements(),
            messagePage.hasNext()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public int getUnreadMessageCount(Integer userID) {
        log.info("Getting unread message count for user {}", userID);
        
        // Verify user exists
        userRepository.findById(userID)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        return messageRepository.countUnreadByUser(userID);
    }

    /**
     * Helper method to determine and create conversation based on user roles
     */
    private Conversation determineAndCreateConversation(User sender, User recipient) {
        User doctor;
        Family family;
        
        // Determine who is the doctor and who is the family
        if (sender.getRole() == UserRole.BacSi && recipient.getRole() == UserRole.ChuHo) {
            doctor = sender;
            family = findFamilyByHeadOfFamily(recipient);
        } else if (sender.getRole() == UserRole.ChuHo && recipient.getRole() == UserRole.BacSi) {
            doctor = recipient;
            family = findFamilyByHeadOfFamily(sender);
        } else {
            throw new ValidationException("Messages can only be sent between doctors and families");
        }
        
        // Verify doctor-family relationship exists and is active
        verifyDoctorFamilyRelationship(doctor.getUserID(), family.getFamilyID());
        
        return getOrCreateConversation(doctor.getUserID(), family.getFamilyID());
    }
    
    /**
     * Verify that an approved doctor-family relationship exists
     */
    private void verifyDoctorFamilyRelationship(Integer doctorID, Integer familyID) {
        boolean hasActiveRelationship = doctorAssignmentRepository
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctorID, familyID, DoctorAssignment.AssignmentStatus.ACTIVE
            );
        
        if (!hasActiveRelationship) {
            log.warn("Attempted messaging without approved relationship - Doctor: {}, Family: {}", 
                    doctorID, familyID);
            throw new UnAuthorizedException("No approved relationship exists between doctor and family");
        }
    }

    /**
     * Helper method to find family by head of family user
     */
    private Family findFamilyByHeadOfFamily(User user) {
        return familyRepository.findAll().stream()
            .filter(f -> f.getHeadOfFamily() != null && 
                        f.getHeadOfFamily().getUserID().equals(user.getUserID()))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("Family not found for user"));
    }

    /**
     * Helper method to check if a user is a participant in a conversation
     */
    private boolean isParticipant(User user, Conversation conversation) {
        if (user.getRole() == UserRole.BacSi) {
            return conversation.getDoctor().getUserID().equals(user.getUserID());
        } else if (user.getRole() == UserRole.ChuHo) {
            return conversation.getFamily().getHeadOfFamily().getUserID().equals(user.getUserID());
        }
        return false;
    }

    @Override
    public void sendTypingIndicator(Integer conversationID, Integer userID, boolean isTyping) {
        log.debug("User {} sending typing indicator for conversation {}: {}", 
                userID, conversationID, isTyping);
        
        // Verify conversation exists
        Conversation conversation = conversationRepository.findById(conversationID)
            .orElseThrow(() -> new NotFoundException("Conversation not found"));
        
        // Verify user exists and is a participant
        User user = userRepository.findById(userID)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        if (!isParticipant(user, conversation)) {
            log.warn("Unauthorized typing indicator: User {} tried to send typing indicator for conversation {}", 
                    userID, conversationID);
            throw new UnAuthorizedException("You do not have permission to access this conversation");
        }
        
        // Send typing indicator through the service
        typingIndicatorService.sendTypingIndicator(conversationID, user, isTyping);
        
        log.debug("Typing indicator sent for user {} in conversation {}", userID, conversationID);
    }
}
