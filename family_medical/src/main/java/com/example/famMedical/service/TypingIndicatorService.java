package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.TypingIndicator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * Service for managing typing indicators in conversations
 * Handles broadcasting typing status and automatic timeout after 3 seconds
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
@Service
@Slf4j
public class TypingIndicatorService {

    private final Sinks.Many<TypingIndicator> typingSink;
    private final Map<String, ScheduledExecutorService> timeoutSchedulers;

    public TypingIndicatorService() {
        // Create a multicast sink for broadcasting typing indicators
        this.typingSink = Sinks.many().multicast().onBackpressureBuffer();
        this.timeoutSchedulers = new ConcurrentHashMap<>();
        log.info("TypingIndicatorService initialized");
    }

    /**
     * Send a typing indicator for a conversation
     * Automatically stops typing after 3 seconds if not manually stopped
     * Requirements: 10.1, 10.2
     * 
     * @param conversationID ID of the conversation
     * @param user User who is typing
     * @param isTyping Whether the user is typing or stopped typing
     */
    public void sendTypingIndicator(Long conversationID, User user, boolean isTyping) {
        log.debug("User {} typing indicator: {} in conversation {}", 
                user.getUserID(), isTyping, conversationID);
        
        String key = getTypingKey(conversationID, user.getUserID());
        
        // Cancel any existing timeout for this user/conversation
        cancelTimeout(key);
        
        // Create and emit the typing indicator
        TypingIndicator indicator = TypingIndicator.builder()
                .conversationID(conversationID)
                .user(user)
                .isTyping(isTyping)
                .build();
        
        typingSink.tryEmitNext(indicator);
        
        // If user started typing, schedule automatic stop after 3 seconds
        if (isTyping) {
            scheduleAutoStop(conversationID, user, key);
        }
    }

    /**
     * Get the stream of typing indicators for a specific conversation
     * Filters to only include indicators for the specified conversation
     * Requirements: 10.4
     * 
     * @param conversationID ID of the conversation to monitor
     * @return Flux of typing indicators for the conversation
     */
    public Flux<TypingIndicator> getTypingStream(Long conversationID) {
        log.debug("Creating typing indicator stream for conversation {}", conversationID);
        
        return typingSink.asFlux()
                .filter(indicator -> indicator.getConversationID().equals(conversationID))
                .doOnNext(indicator -> log.trace("Emitting typing indicator for conversation {}: user {} isTyping={}", 
                        conversationID, indicator.getUser().getUserID(), indicator.isTyping()))
                .doOnCancel(() -> log.debug("Typing indicator stream cancelled for conversation {}", conversationID));
    }

    /**
     * Stop typing indicator for a user in a conversation
     * Called when a message is sent
     * Requirements: 10.3
     * 
     * @param conversationID ID of the conversation
     * @param user User who stopped typing
     */
    public void stopTyping(Long conversationID, User user) {
        log.debug("Stopping typing indicator for user {} in conversation {}", 
                user.getUserID(), conversationID);
        
        String key = getTypingKey(conversationID, user.getUserID());
        cancelTimeout(key);
        
        // Send stop typing indicator
        TypingIndicator indicator = TypingIndicator.builder()
                .conversationID(conversationID)
                .user(user)
                .isTyping(false)
                .build();
        
        typingSink.tryEmitNext(indicator);
    }

    /**
     * Schedule automatic stop typing after 3 seconds
     * Requirements: 10.2
     */
    private void scheduleAutoStop(Long conversationID, User user, String key) {
        ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(1);
        timeoutSchedulers.put(key, scheduler);
        
        scheduler.schedule(() -> {
            log.debug("Auto-stopping typing indicator for user {} in conversation {} after 3 seconds", 
                    user.getUserID(), conversationID);
            
            TypingIndicator stopIndicator = TypingIndicator.builder()
                    .conversationID(conversationID)
                    .user(user)
                    .isTyping(false)
                    .build();
            
            typingSink.tryEmitNext(stopIndicator);
            
            // Clean up scheduler
            timeoutSchedulers.remove(key);
            scheduler.shutdown();
        }, 3, TimeUnit.SECONDS);
    }

    /**
     * Cancel any existing timeout for a user/conversation
     */
    private void cancelTimeout(String key) {
        ScheduledExecutorService existingScheduler = timeoutSchedulers.remove(key);
        if (existingScheduler != null) {
            existingScheduler.shutdownNow();
            log.trace("Cancelled existing typing timeout for {}", key);
        }
    }

    /**
     * Generate a unique key for a user typing in a conversation
     */
    private String getTypingKey(Long conversationID, Integer userID) {
        return conversationID + ":" + userID;
    }
}
