package com.example.famMedical.resolver;

import com.example.famMedical.Entity.Conversation;
import com.example.famMedical.Entity.Message;
import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.MarkMessageAsReadInput;
import com.example.famMedical.dto.MessageConnection;
import com.example.famMedical.dto.MessageSearchInput;
import com.example.famMedical.dto.SendMessageInput;
import com.example.famMedical.exception.UnAuthorizedException;
import com.example.famMedical.repository.ConversationRepository;
import com.example.famMedical.repository.MessageRepository;
import com.example.famMedical.service.MessagePublisher;
import com.example.famMedical.service.MessageService;
import com.example.famMedical.service.TypingIndicatorService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * GraphQL Resolver for Message operations
 * Handles queries, mutations, and subscriptions for messaging functionality
 * 
 * Security Implementation:
 * - Requirement 7.1: All operations require authentication via @PreAuthorize("isAuthenticated()")
 * - Requirement 7.2: Conversation participant verification on all conversation access
 * - Requirement 7.3: User filtering in subscription streams to deliver only relevant messages
 * - Requirement 7.4: Notification ownership verification (handled by NotificationResolver)
 * - Requirement 7.5: Doctor-family relationship verification before messaging
 */
@Controller
@AllArgsConstructor
@Slf4j
public class MessageResolver {

    private final MessageService messageService;
    private final MessagePublisher messagePublisher;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final TypingIndicatorService typingIndicatorService;

    // =======================================================
    // MUTATIONS
    // =======================================================

    /**
     * Send a message to another user
     * Requirements: 1.1, 1.2, 1.4
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Message sendMessage(
            @AuthenticationPrincipal User currentUser,
            @Argument SendMessageInput input) {
        log.info("User {} sending message to recipient {}", 
                currentUser.getUserID(), input.getRecipientID());
        
        Message message = messageService.sendMessage(
                currentUser.getUserID(),
                input.getRecipientID(),
                input.getContent(),
                input.getConversationID(),
                input.getAttachments()
        );
        
        log.info("Message {} sent successfully", message.getMessageID());
        return message;
    }

    /**
     * Mark a message as read
     * Requirements: 3.2, 3.3
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Message markMessageAsRead(
            @AuthenticationPrincipal User currentUser,
            @Argument MarkMessageAsReadInput input) {
        log.info("User {} marking message {} as read", 
                currentUser.getUserID(), input.getMessageID());
        
        Message message = messageService.markMessageAsRead(
                input.getMessageID(),
                currentUser.getUserID()
        );
        
        log.info("Message {} marked as read", message.getMessageID());
        return message;
    }

    /**
     * Mark all messages in a conversation as read
     * Requirements: 3.2, 3.3
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean markConversationAsRead(
            @AuthenticationPrincipal User currentUser,
            @Argument Long conversationID) {
        log.info("User {} marking conversation {} as read", 
                currentUser.getUserID(), conversationID);
        
        // Verify user is a participant in the conversation
        Conversation conversation = conversationRepository.findById(conversationID)
                .orElseThrow(() -> new UnAuthorizedException("Conversation not found"));
        
        if (!isUserParticipant(conversation, currentUser)) {
            throw new UnAuthorizedException("You do not have permission to access this conversation");
        }
        
        messageService.markConversationAsRead(conversationID, currentUser.getUserID());
        
        log.info("Conversation {} marked as read", conversationID);
        return true;
    }

    /**
     * Send typing indicator for a conversation
     * Requirements: 10.1, 10.2
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean sendTypingIndicator(
            @AuthenticationPrincipal User currentUser,
            @Argument com.example.famMedical.dto.TypingIndicatorInput input) {
        log.debug("User {} sending typing indicator for conversation {}: {}", 
                currentUser.getUserID(), input.getConversationID(), input.getIsTyping());
        
        messageService.sendTypingIndicator(
                input.getConversationID(),
                currentUser.getUserID(),
                input.getIsTyping() != null ? input.getIsTyping() : false
        );
        
        return true;
    }

    // =======================================================
    // QUERIES
    // =======================================================

    /**
     * Get all conversations for the current user
     * Requirements: 2.1, 2.2
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Conversation> myConversations(
            @AuthenticationPrincipal User currentUser,
            @Argument Integer page,
            @Argument Integer size) {
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        
        log.info("User {} fetching conversations (page: {}, size: {})", 
                currentUser.getUserID(), pageNum, pageSize);
        
        List<Conversation> conversations = messageService.getUserConversations(
                currentUser.getUserID(), pageNum, pageSize);
        
        log.info("Found {} conversations for user {}", 
                conversations.size(), currentUser.getUserID());
        return conversations;
    }

    /**
     * Get details of a specific conversation
     * Requirements: 2.3
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Conversation conversationDetail(
            @AuthenticationPrincipal User currentUser,
            @Argument Long conversationID) {
        log.info("User {} fetching conversation detail {}", 
                currentUser.getUserID(), conversationID);
        
        Conversation conversation = conversationRepository.findById(conversationID)
                .orElseThrow(() -> new UnAuthorizedException("Conversation not found"));
        
        // Verify user is a participant
        if (!isUserParticipant(conversation, currentUser)) {
            throw new UnAuthorizedException("You do not have permission to access this conversation");
        }
        
        return conversation;
    }

    /**
     * Get or create a conversation with another user
     * Requirements: 2.1
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Conversation conversationWithUser(
            @AuthenticationPrincipal User currentUser,
            @Argument Integer otherUserID) {
        log.info("User {} fetching conversation with user {}", 
                currentUser.getUserID(), otherUserID);
        
        // Determine if current user is doctor or family
        // This is a simplified implementation - in production you'd need to determine
        // the family ID from the user's family relationship
        Conversation conversation = messageService.getOrCreateConversation(
                currentUser.getUserID(), otherUserID);
        
        return conversation;
    }

    /**
     * Get messages in a conversation with pagination
     * Requirements: 1.5, 2.5
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public MessageConnection conversationMessages(
            @AuthenticationPrincipal User currentUser,
            @Argument Long conversationID,
            @Argument Integer page,
            @Argument Integer size) {
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 50;
        
        log.info("User {} fetching messages for conversation {} (page: {}, size: {})", 
                currentUser.getUserID(), conversationID, pageNum, pageSize);
        
        // Verify user is a participant
        Conversation conversation = conversationRepository.findById(conversationID)
                .orElseThrow(() -> new UnAuthorizedException("Conversation not found"));
        
        if (!isUserParticipant(conversation, currentUser)) {
            throw new UnAuthorizedException("You do not have permission to access this conversation");
        }
        
        MessageConnection messages = messageService.getConversationMessages(
                conversationID, pageNum, pageSize);
        
        log.info("Found {} messages for conversation {}", 
                messages.getMessages().size(), conversationID);
        return messages;
    }

    /**
     * Search messages with filters
     * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public MessageConnection searchMessages(
            @AuthenticationPrincipal User currentUser,
            @Argument MessageSearchInput input) {
        int pageNum = input.getPage() != null ? input.getPage() : 0;
        int pageSize = input.getSize() != null ? input.getSize() : 50;
        
        log.info("User {} searching messages with keyword: {}", 
                currentUser.getUserID(), input.getKeyword());
        
        MessageConnection results = messageService.searchMessages(
                currentUser.getUserID(),
                input.getKeyword(),
                input.getConversationID(),
                input.getStartDate(),
                input.getEndDate(),
                pageNum,
                pageSize
        );
        
        log.info("Found {} messages matching search criteria", results.getMessages().size());
        return results;
    }

    /**
     * Get count of unread messages for current user
     * Requirements: 2.4, 3.4
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Integer unreadMessageCount(@AuthenticationPrincipal User currentUser) {
        log.info("User {} fetching unread message count", currentUser.getUserID());
        
        int count = messageService.getUnreadMessageCount(currentUser.getUserID());
        
        log.info("User {} has {} unread messages", currentUser.getUserID(), count);
        return count;
    }

    // =======================================================
    // SUBSCRIPTIONS
    // =======================================================

    /**
     * Subscribe to new messages for the current user
     * Requirements: 4.1, 4.2, 4.5
     */
    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    public Flux<Message> messageReceived(@AuthenticationPrincipal User currentUser) {
        log.info("User {} subscribing to message stream", currentUser.getUserID());
        
        return messagePublisher.getMessageStream(currentUser)
                .doOnNext(message -> log.debug("Delivering message {} to user {}", 
                        message.getMessageID(), currentUser.getUserID()))
                .doOnCancel(() -> log.info("User {} unsubscribed from message stream", 
                        currentUser.getUserID()));
    }

    /**
     * Subscribe to conversation updates for the current user
     * Requirements: 4.1, 4.2
     */
    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    public Flux<Conversation> conversationUpdated(@AuthenticationPrincipal User currentUser) {
        log.info("User {} subscribing to conversation updates", currentUser.getUserID());
        
        return messagePublisher.getConversationStream(currentUser)
                .doOnNext(conversation -> log.debug("Delivering conversation update {} to user {}", 
                        conversation.getConversationID(), currentUser.getUserID()))
                .doOnCancel(() -> log.info("User {} unsubscribed from conversation updates", 
                        currentUser.getUserID()));
    }

    /**
     * Subscribe to typing indicators for a specific conversation
     * Requirements: 10.4
     */
    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    public Flux<com.example.famMedical.dto.TypingIndicator> typingIndicator(
            @AuthenticationPrincipal User currentUser,
            @Argument Long conversationID) {
        log.info("User {} subscribing to typing indicators for conversation {}", 
                currentUser.getUserID(), conversationID);
        
        // Verify user is a participant in the conversation
        Conversation conversation = conversationRepository.findById(conversationID)
                .orElseThrow(() -> new UnAuthorizedException("Conversation not found"));
        
        if (!isUserParticipant(conversation, currentUser)) {
            throw new UnAuthorizedException("You do not have permission to access this conversation");
        }
        
        return typingIndicatorService.getTypingStream(conversationID)
                .filter(indicator -> !indicator.getUser().getUserID().equals(currentUser.getUserID()))
                .doOnNext(indicator -> log.trace("Delivering typing indicator to user {}: user {} isTyping={}", 
                        currentUser.getUserID(), indicator.getUser().getUserID(), indicator.isTyping()))
                .doOnCancel(() -> log.info("User {} unsubscribed from typing indicators for conversation {}", 
                        currentUser.getUserID(), conversationID));
    }

    // =======================================================
    // SCHEMA MAPPINGS (Field Resolvers)
    // =======================================================

    /**
     * Resolve unreadCount field for Conversation type
     * Requirements: 2.4
     */
    @SchemaMapping(typeName = "Conversation", field = "unreadCount")
    public Integer unreadCount(
            Conversation conversation,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return 0;
        }
        
        int count = messageRepository.countUnreadByConversationAndUser(
                conversation.getConversationID(), 
                currentUser.getUserID()
        );
        
        return count;
    }

    /**
     * Resolve messages field for Conversation type with pagination
     * Requirements: 1.5, 2.5
     */
    @SchemaMapping(typeName = "Conversation", field = "messages")
    public MessageConnection messages(
            Conversation conversation,
            @Argument Integer page,
            @Argument Integer size) {
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 50;
        
        return messageService.getConversationMessages(
                conversation.getConversationID(), 
                pageNum, 
                pageSize
        );
    }

    // =======================================================
    // HELPER METHODS
    // =======================================================

    /**
     * Check if a user is a participant in a conversation
     */
    private boolean isUserParticipant(Conversation conversation, User user) {
        if (conversation == null || user == null) {
            return false;
        }
        
        // Check if user is the doctor
        if (conversation.getDoctor() != null && 
            conversation.getDoctor().getUserID().equals(user.getUserID())) {
            return true;
        }
        
        // Check if user is the head of family
        if (conversation.getFamily() != null && 
            conversation.getFamily().getHeadOfFamily() != null &&
            conversation.getFamily().getHeadOfFamily().getUserID().equals(user.getUserID())) {
            return true;
        }
        
        return false;
    }
}
