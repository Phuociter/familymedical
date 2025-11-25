package com.example.famMedical.service;

import com.example.famMedical.Entity.Notification;
import com.example.famMedical.Entity.User;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * Notification Publisher Service
 * Manages real-time notification streaming using Reactor Sinks
 * Publishes notifications to subscribed clients
 */
@Service
public class NotificationPublisher {

    // Sink for broadcasting notifications to all subscribers
    private final Sinks.Many<Notification> notificationSink = 
        Sinks.many().multicast().onBackpressureBuffer();

    /**
     * Publish a new notification to all subscribers
     * @param notification The notification to publish
     */
    public void publishNotification(Notification notification) {
        Sinks.EmitResult result = notificationSink.tryEmitNext(notification);
        if (result.isFailure()) {
            System.err.println("Failed to publish notification: " + result);
        }
    }

    /**
     * Get notification stream filtered for a specific user
     * Only returns notifications that belong to the specified user
     * @param user The user to filter notifications for
     * @return Flux of notifications for the user
     */
    public Flux<Notification> getNotificationStream(User user) {
        return notificationSink.asFlux()
            .filter(notification -> isNotificationForUser(notification, user));
    }

    /**
     * Check if a notification belongs to a specific user
     * @param notification The notification to check
     * @param user The user to check against
     * @return true if the notification belongs to the user
     */
    private boolean isNotificationForUser(Notification notification, User user) {
        if (notification == null || user == null || notification.getUser() == null) {
            return false;
        }
        
        return notification.getUser().getUserID().equals(user.getUserID());
    }
}
