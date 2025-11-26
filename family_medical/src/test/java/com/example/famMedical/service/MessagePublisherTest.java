package com.example.famMedical.service;

import com.example.famMedical.Entity.Conversation;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Message;
import com.example.famMedical.Entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test for MessagePublisher Service
 * Verifies message and conversation streaming functionality
 */
class MessagePublisherTest {

    private MessagePublisher messagePublisher;
    private User testDoctor;
    private User testFamilyHead;
    private Family testFamily;
    private Conversation testConversation;

    @BeforeEach
    void setUp() {
        messagePublisher = new MessagePublisher();

        // Create test doctor
        testDoctor = new User();
        testDoctor.setUserID(1);
        testDoctor.setEmail("doctor@test.com");

        // Create test family head
        testFamilyHead = new User();
        testFamilyHead.setUserID(2);
        testFamilyHead.setEmail("family@test.com");

        // Create test family
        testFamily = new Family();
        testFamily.setFamilyID(1);
        testFamily.setHeadOfFamily(testFamilyHead);

        // Create test conversation
        testConversation = Conversation.builder()
                .conversationID(1)
                .doctor(testDoctor)
                .family(testFamily)
                .build();
    }

    @Test
    void publishMessage_shouldEmitMessage() {
        // Create a message
        Message message = Message.builder()
                .messageID(1)
                .conversation(testConversation)
                .sender(testDoctor)
                .content("Test message")
                .build();

        // Subscribe to message stream for family head
        Flux<Message> messageStream = messagePublisher.getMessageStream(testFamilyHead);

        // Verify that the message is received
        StepVerifier.create(messageStream.take(1))
                .then(() -> messagePublisher.publishMessage(message))
                .expectNextMatches(m -> m.getMessageID().equals(1) && 
                                       m.getContent().equals("Test message"))
                .verifyComplete();
    }

    @Test
    void publishConversationUpdate_shouldEmitConversation() {
        // Subscribe to conversation stream for family head
        Flux<Conversation> conversationStream = messagePublisher.getConversationStream(testFamilyHead);

        // Verify that the conversation update is received
        StepVerifier.create(conversationStream.take(1))
                .then(() -> messagePublisher.publishConversationUpdate(testConversation))
                .expectNextMatches(c -> c.getConversationID().equals(1))
                .verifyComplete();
    }

    @Test
    void getMessageStream_shouldFilterMessagesForUser() {
        // Create messages from different senders
        Message messageFromDoctor = Message.builder()
                .messageID(1)
                .conversation(testConversation)
                .sender(testDoctor)
                .content("From doctor")
                .build();

        Message messageFromFamily = Message.builder()
                .messageID(2)
                .conversation(testConversation)
                .sender(testFamilyHead)
                .content("From family")
                .build();

        // Subscribe to message stream for family head
        Flux<Message> messageStream = messagePublisher.getMessageStream(testFamilyHead)
                .take(1)
                .timeout(Duration.ofSeconds(2));

        // Publish both messages
        StepVerifier.create(messageStream)
                .then(() -> {
                    messagePublisher.publishMessage(messageFromDoctor);
                    messagePublisher.publishMessage(messageFromFamily);
                })
                .expectNextMatches(m -> m.getMessageID().equals(1)) // Should only receive message from doctor
                .verifyComplete();
    }

    @Test
    void getConversationStream_shouldFilterConversationsForUser() {
        // Create another conversation that doesn't involve the test family
        User anotherDoctor = new User();
        anotherDoctor.setUserID(3);

        User anotherFamilyHead = new User();
        anotherFamilyHead.setUserID(4);

        Family anotherFamily = new Family();
        anotherFamily.setFamilyID(2);
        anotherFamily.setHeadOfFamily(anotherFamilyHead);

        Conversation anotherConversation = Conversation.builder()
                .conversationID(2)
                .doctor(anotherDoctor)
                .family(anotherFamily)
                .build();

        // Subscribe to conversation stream for test family head
        Flux<Conversation> conversationStream = messagePublisher.getConversationStream(testFamilyHead)
                .take(1)
                .timeout(Duration.ofSeconds(2));

        // Publish both conversations
        StepVerifier.create(conversationStream)
                .then(() -> {
                    messagePublisher.publishConversationUpdate(testConversation);
                    messagePublisher.publishConversationUpdate(anotherConversation);
                })
                .expectNextMatches(c -> c.getConversationID().equals(1)) // Should only receive own conversation
                .verifyComplete();
    }
}
