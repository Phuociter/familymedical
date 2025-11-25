package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.dto.TypingIndicator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TypingIndicatorService
 * Tests typing indicator broadcasting and timeout functionality
 */
class TypingIndicatorServiceTest {

    private TypingIndicatorService typingIndicatorService;
    private User testUser;

    @BeforeEach
    void setUp() {
        typingIndicatorService = new TypingIndicatorService();
        
        testUser = new User();
        testUser.setUserID(1);
        testUser.setFullName("Test User");
        testUser.setEmail("test@test.com");
        testUser.setRole(UserRole.BacSi);
    }

    @Test
    @DisplayName("Should broadcast typing indicator to conversation stream")
    void sendTypingIndicator_BroadcastsToStream() {
        Long conversationID = 1L;
        
        // Subscribe to the typing stream
        Flux<TypingIndicator> stream = typingIndicatorService.getTypingStream(conversationID);
        
        // Send typing indicator
        typingIndicatorService.sendTypingIndicator(conversationID, testUser, true);
        
        // Verify the indicator is received
        StepVerifier.create(stream.take(1))
            .assertNext(indicator -> {
                assertEquals(conversationID, indicator.getConversationID());
                assertEquals(testUser.getUserID(), indicator.getUser().getUserID());
                assertTrue(indicator.isTyping());
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Should filter typing indicators by conversation ID")
    void getTypingStream_FiltersByConversationID() {
        Long conversationID1 = 1L;
        Long conversationID2 = 2L;
        
        // Subscribe to conversation 1 stream
        Flux<TypingIndicator> stream = typingIndicatorService.getTypingStream(conversationID1);
        
        // Send indicators to both conversations
        typingIndicatorService.sendTypingIndicator(conversationID1, testUser, true);
        typingIndicatorService.sendTypingIndicator(conversationID2, testUser, true);
        
        // Verify only conversation 1 indicator is received
        StepVerifier.create(stream.take(1))
            .assertNext(indicator -> {
                assertEquals(conversationID1, indicator.getConversationID());
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Should send stop typing indicator")
    void stopTyping_SendsStopIndicator() {
        Long conversationID = 1L;
        
        // Subscribe to the typing stream
        Flux<TypingIndicator> stream = typingIndicatorService.getTypingStream(conversationID);
        
        // Stop typing
        typingIndicatorService.stopTyping(conversationID, testUser);
        
        // Verify stop indicator is received
        StepVerifier.create(stream.take(1))
            .assertNext(indicator -> {
                assertEquals(conversationID, indicator.getConversationID());
                assertEquals(testUser.getUserID(), indicator.getUser().getUserID());
                assertFalse(indicator.isTyping());
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Should automatically stop typing after 3 seconds")
    void sendTypingIndicator_AutoStopsAfter3Seconds() {
        Long conversationID = 1L;
        
        // Subscribe to the typing stream
        Flux<TypingIndicator> stream = typingIndicatorService.getTypingStream(conversationID);
        
        // Send start typing indicator
        typingIndicatorService.sendTypingIndicator(conversationID, testUser, true);
        
        // Verify we receive start typing, then stop typing after 3 seconds
        StepVerifier.create(stream.take(2).timeout(Duration.ofSeconds(5)))
            .assertNext(indicator -> {
                assertTrue(indicator.isTyping(), "First indicator should be typing=true");
            })
            .assertNext(indicator -> {
                assertFalse(indicator.isTyping(), "Second indicator should be typing=false after timeout");
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Should cancel previous timeout when new typing indicator is sent")
    void sendTypingIndicator_CancelsPreviousTimeout() {
        Long conversationID = 1L;
        
        // Subscribe to the typing stream
        Flux<TypingIndicator> stream = typingIndicatorService.getTypingStream(conversationID);
        
        // Send start typing indicator
        typingIndicatorService.sendTypingIndicator(conversationID, testUser, true);
        
        // Wait 2 seconds and send another start typing (should reset the 3-second timer)
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            fail("Thread interrupted");
        }
        
        typingIndicatorService.sendTypingIndicator(conversationID, testUser, true);
        
        // Verify we receive two start indicators, then one stop after 3 seconds from the second start
        StepVerifier.create(stream.take(3).timeout(Duration.ofSeconds(6)))
            .assertNext(indicator -> assertTrue(indicator.isTyping()))
            .assertNext(indicator -> assertTrue(indicator.isTyping()))
            .assertNext(indicator -> assertFalse(indicator.isTyping()))
            .verifyComplete();
    }
}
