package com.example.famMedical.service;

import com.example.famMedical.Entity.Notification;
import com.example.famMedical.Entity.NotificationType;
import com.example.famMedical.Entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

/**
 * Test for NotificationPublisher Service
 * Verifies notification streaming functionality
 */
class NotificationPublisherTest {

    private NotificationPublisher notificationPublisher;
    private User testUser;
    private User anotherUser;

    @BeforeEach
    void setUp() {
        notificationPublisher = new NotificationPublisher();

        // Create test users
        testUser = new User();
        testUser.setUserID(1);
        testUser.setEmail("user1@test.com");

        anotherUser = new User();
        anotherUser.setUserID(2);
        anotherUser.setEmail("user2@test.com");
    }

    @Test
    void publishNotification_shouldEmitNotification() {
        // Create a notification
        Notification notification = Notification.builder()
                .notificationID(1L)
                .user(testUser)
                .type(NotificationType.NEW_MESSAGE)
                .title("New Message")
                .message("You have a new message")
                .build();

        // Subscribe to notification stream for test user
        Flux<Notification> notificationStream = notificationPublisher.getNotificationStream(testUser);

        // Verify that the notification is received
        StepVerifier.create(notificationStream.take(1))
                .then(() -> notificationPublisher.publishNotification(notification))
                .expectNextMatches(n -> n.getNotificationID().equals(1L) && 
                                       n.getTitle().equals("New Message"))
                .verifyComplete();
    }

    @Test
    void getNotificationStream_shouldFilterNotificationsForUser() {
        // Create notifications for different users
        Notification notificationForUser1 = Notification.builder()
                .notificationID(1L)
                .user(testUser)
                .type(NotificationType.NEW_MESSAGE)
                .title("For User 1")
                .message("Message for user 1")
                .build();

        Notification notificationForUser2 = Notification.builder()
                .notificationID(2L)
                .user(anotherUser)
                .type(NotificationType.APPOINTMENT_CREATED)
                .title("For User 2")
                .message("Message for user 2")
                .build();

        // Subscribe to notification stream for test user
        Flux<Notification> notificationStream = notificationPublisher.getNotificationStream(testUser)
                .take(1)
                .timeout(Duration.ofSeconds(2));

        // Publish both notifications
        StepVerifier.create(notificationStream)
                .then(() -> {
                    notificationPublisher.publishNotification(notificationForUser1);
                    notificationPublisher.publishNotification(notificationForUser2);
                })
                .expectNextMatches(n -> n.getNotificationID().equals(1L)) // Should only receive own notification
                .verifyComplete();
    }

    @Test
    void publishNotification_shouldHandleMultipleSubscribers() {
        // Create a notification
        Notification notification = Notification.builder()
                .notificationID(1L)
                .user(testUser)
                .type(NotificationType.NEW_MESSAGE)
                .title("New Message")
                .message("You have a new message")
                .build();

        // Subscribe multiple times for the same user
        Flux<Notification> stream1 = notificationPublisher.getNotificationStream(testUser).take(1);
        Flux<Notification> stream2 = notificationPublisher.getNotificationStream(testUser).take(1);

        // Both streams should receive the notification
        StepVerifier.create(Flux.merge(stream1, stream2).take(2))
                .then(() -> notificationPublisher.publishNotification(notification))
                .expectNextCount(2)
                .verifyComplete();
    }
}
