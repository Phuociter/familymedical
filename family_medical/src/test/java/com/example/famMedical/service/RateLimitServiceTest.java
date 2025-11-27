package com.example.famMedical.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for Rate Limiting Service
 * Optional security feature for preventing message spam
 */
@DisplayName("Rate Limit Service Tests")
class RateLimitServiceTest {

    private RateLimitService rateLimitService;
    
    @BeforeEach
    void setUp() {
        rateLimitService = new RateLimitService();
    }
    
    @Test
    @DisplayName("Should allow first message from user")
    void testFirstMessageAllowed() {
        // When
        boolean canSend = rateLimitService.canSendMessage(1);
        
        // Then
        assertTrue(canSend);
    }
    
    @Test
    @DisplayName("Should allow messages with sufficient time gap")
    void testMessagesWithTimeGap() throws InterruptedException {
        // Given
        rateLimitService.recordMessageSent(1);
        
        // Wait for minimum time between messages
        Thread.sleep(1100);
        
        // When
        boolean canSend = rateLimitService.canSendMessage(1);
        
        // Then
        assertTrue(canSend);
    }
    
    @Test
    @DisplayName("Should prevent messages sent too quickly")
    void testMessagesTooQuick() {
        // Given
        rateLimitService.recordMessageSent(1);
        
        // When - try to send immediately
        boolean canSend = rateLimitService.canSendMessage(1);
        
        // Then
        assertFalse(canSend);
    }
    
    @Test
    @DisplayName("Should track remaining messages correctly")
    void testRemainingMessages() {
        // Given - user has not sent any messages
        int remaining = rateLimitService.getRemainingMessages(1);
        
        // Then
        assertEquals(20, remaining);
        
        // When - send a message
        rateLimitService.recordMessageSent(1);
        remaining = rateLimitService.getRemainingMessages(1);
        
        // Then
        assertEquals(19, remaining);
    }
    
    @Test
    @DisplayName("Should allow different users independently")
    void testDifferentUsersIndependent() {
        // Given
        rateLimitService.recordMessageSent(1);
        
        // When - different user tries to send
        boolean canSend = rateLimitService.canSendMessage(2);
        
        // Then
        assertTrue(canSend);
    }
}
