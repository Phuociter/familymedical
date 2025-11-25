package com.example.famMedical.service;

import com.example.famMedical.Entity.Conversation;
import com.example.famMedical.Entity.Message;
import com.example.famMedical.Entity.User;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * Message Publisher Service
 * Manages real-time message streaming using Reactor Sinks
 * Publishes messages and conversation updates to subscribed clients
 */
@Service
public class MessagePublisher {

    // Sink for broadcasting new messages to all subscribers
    private final Sinks.Many<Message> messageSink = 
        Sinks.many().multicast().onBackpressureBuffer();
    
    // Sink for broadcasting conversation updates to all subscribers
    private final Sinks.Many<Conversation> conversationSink = 
        Sinks.many().multicast().onBackpressureBuffer();

    /**
     * Publish a new message to all subscribers
     * @param message The message to publish
     */
    public void publishMessage(Message message) {
        Sinks.EmitResult result = messageSink.tryEmitNext(message);
        if (result.isFailure()) {
            System.err.println("Failed to publish message: " + result);
        }
    }

    /**
     * Publish a conversation update to all subscribers
     * @param conversation The conversation to publish
     */
    public void publishConversationUpdate(Conversation conversation) {
        Sinks.EmitResult result = conversationSink.tryEmitNext(conversation);
        if (result.isFailure()) {
            System.err.println("Failed to publish conversation update: " + result);
        }
    }

    /**
     * Get message stream filtered for a specific user
     * Only returns messages where the user is the recipient
     * @param user The user to filter messages for
     * @return Flux of messages for the user
     */
    public Flux<Message> getMessageStream(User user) {
        return messageSink.asFlux()
            .filter(message -> isMessageForUser(message, user));
    }

    /**
     * Get conversation update stream filtered for a specific user
     * Only returns conversations where the user is a participant
     * @param user The user to filter conversations for
     * @return Flux of conversations for the user
     */
    public Flux<Conversation> getConversationStream(User user) {
        return conversationSink.asFlux()
            .filter(conversation -> isConversationForUser(conversation, user));
    }

    /**
     * Check if a message is intended for a specific user
     * A message is for a user if they are the recipient (not the sender)
     * @param message The message to check
     * @param user The user to check against
     * @return true if the message is for the user
     */
    private boolean isMessageForUser(Message message, User user) {
        if (message == null || user == null || message.getConversation() == null) {
            return false;
        }
        
        Conversation conversation = message.getConversation();
        
        // Message is for the user if they are a participant but not the sender
        boolean isParticipant = isConversationForUser(conversation, user);
        boolean isSender = message.getSender() != null && 
                          message.getSender().getUserID().equals(user.getUserID());
        
        return isParticipant && !isSender;
    }

    /**
     * Check if a conversation involves a specific user
     * A conversation involves a user if they are the doctor or part of the family
     * @param conversation The conversation to check
     * @param user The user to check against
     * @return true if the user is a participant in the conversation
     */
    private boolean isConversationForUser(Conversation conversation, User user) {
        if (conversation == null || user == null) {
            return false;
        }
        
        // Check if user is the doctor
        if (conversation.getDoctor() != null && 
            conversation.getDoctor().getUserID().equals(user.getUserID())) {
            return true;
        }
        
        // Check if user belongs to the family (is the head of family)
        if (conversation.getFamily() != null && 
            conversation.getFamily().getHeadOfFamily() != null &&
            conversation.getFamily().getHeadOfFamily().getUserID().equals(user.getUserID())) {
            return true;
        }
        
        return false;
    }
}
