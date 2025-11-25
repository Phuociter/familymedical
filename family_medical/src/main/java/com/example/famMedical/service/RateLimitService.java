package com.example.famMedical.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Service for Message Sending
 * Implements a simple token bucket algorithm to prevent message spam
 * Optional feature for Requirement 7.1 (Security)
 */
@Service
@Slf4j
public class RateLimitService {

    // Store last message timestamps per user
    private final Map<Integer, MessageRateLimit> userRateLimits = new ConcurrentHashMap<>();
    
    // Configuration
    private static final int MAX_MESSAGES_PER_MINUTE = 20;
    private static final int MIN_SECONDS_BETWEEN_MESSAGES = 1;
    
    /**
     * Check if a user can send a message based on rate limits
     * @param userID The user attempting to send a message
     * @return true if the user is within rate limits, false otherwise
     */
    public boolean canSendMessage(Integer userID) {
        LocalDateTime now = LocalDateTime.now();
        MessageRateLimit rateLimit = userRateLimits.computeIfAbsent(
            userID, 
            k -> new MessageRateLimit()
        );
        
        // Check minimum time between messages
        if (rateLimit.lastMessageTime != null) {
            long secondsSinceLastMessage = java.time.Duration.between(
                rateLimit.lastMessageTime, now
            ).getSeconds();
            
            if (secondsSinceLastMessage < MIN_SECONDS_BETWEEN_MESSAGES) {
                log.warn("Rate limit exceeded for user {}: messages too frequent", userID);
                return false;
            }
        }
        
        // Clean up old message timestamps (older than 1 minute)
        rateLimit.messageTimestamps.removeIf(timestamp -> 
            java.time.Duration.between(timestamp, now).getSeconds() > 60
        );
        
        // Check messages per minute limit
        if (rateLimit.messageTimestamps.size() >= MAX_MESSAGES_PER_MINUTE) {
            log.warn("Rate limit exceeded for user {}: too many messages per minute", userID);
            return false;
        }
        
        return true;
    }
    
    /**
     * Record that a user has sent a message
     * @param userID The user who sent the message
     */
    public void recordMessageSent(Integer userID) {
        LocalDateTime now = LocalDateTime.now();
        MessageRateLimit rateLimit = userRateLimits.computeIfAbsent(
            userID, 
            k -> new MessageRateLimit()
        );
        
        rateLimit.lastMessageTime = now;
        rateLimit.messageTimestamps.add(now);
        
        log.debug("Recorded message for user {}. Messages in last minute: {}", 
                userID, rateLimit.messageTimestamps.size());
    }
    
    /**
     * Get remaining messages allowed for a user in the current minute
     * @param userID The user to check
     * @return Number of messages remaining
     */
    public int getRemainingMessages(Integer userID) {
        MessageRateLimit rateLimit = userRateLimits.get(userID);
        if (rateLimit == null) {
            return MAX_MESSAGES_PER_MINUTE;
        }
        
        LocalDateTime now = LocalDateTime.now();
        rateLimit.messageTimestamps.removeIf(timestamp -> 
            java.time.Duration.between(timestamp, now).getSeconds() > 60
        );
        
        return Math.max(0, MAX_MESSAGES_PER_MINUTE - rateLimit.messageTimestamps.size());
    }
    
    /**
     * Inner class to track rate limit data per user
     */
    private static class MessageRateLimit {
        LocalDateTime lastMessageTime;
        java.util.List<LocalDateTime> messageTimestamps = new java.util.ArrayList<>();
    }
}
