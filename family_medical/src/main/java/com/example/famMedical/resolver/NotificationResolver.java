package com.example.famMedical.resolver;

import com.example.famMedical.Entity.Notification;
import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.MarkNotificationAsReadInput;
import com.example.famMedical.dto.NotificationConnection;
import com.example.famMedical.service.NotificationPublisher;
import com.example.famMedical.service.NotificationService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

/**
 * GraphQL Resolver for Notification operations
 * Handles queries, mutations, and subscriptions for notification functionality
 * 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.4
 */
@Controller
@AllArgsConstructor
@Slf4j
public class NotificationResolver {

    private final NotificationService notificationService;
    private final NotificationPublisher notificationPublisher;

    // =======================================================
    // QUERIES
    // =======================================================

    /**
     * Get all notifications for the current user with pagination
     * 6.3, 7.1, 7.4
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public NotificationConnection myNotifications(
            @AuthenticationPrincipal User currentUser,
            @Argument Integer page,
            @Argument Integer size) {
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        
        log.info("User {} fetching notifications (page: {}, size: {})", 
                currentUser.getUserID(), pageNum, pageSize);
        
        NotificationConnection notifications = notificationService.getUserNotifications(
                currentUser.getUserID(), pageNum, pageSize);
        
        log.info("Found {} notifications for user {}", 
                notifications.getNotifications().size(), currentUser.getUserID());
        return notifications;
    }

    /**
     * Get count of unread notifications for current user
     * 6.5, 7.1, 7.4
     */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Integer unreadNotificationCount(@AuthenticationPrincipal User currentUser) {
        log.info("User {} fetching unread notification count", currentUser.getUserID());
        
        int count = notificationService.getUnreadNotificationCount(currentUser.getUserID());
        
        log.info("User {} has {} unread notifications", currentUser.getUserID(), count);
        return count;
    }

    // =======================================================
    // MUTATIONS
    // =======================================================

    /**
     * Mark a notification as read
     * 6.4, 7.1, 7.4
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Notification markNotificationAsRead(
            @AuthenticationPrincipal User currentUser,
            @Argument MarkNotificationAsReadInput input) {
        log.info("User {} marking notification {} as read", 
                currentUser.getUserID(), input.getNotificationID());
        
        Notification notification = notificationService.markAsRead(
                input.getNotificationID(),
                currentUser.getUserID()
        );
        
        log.info("Notification {} marked as read", notification.getNotificationID());
        return notification;
    }

    /**
     * Mark all notifications as read for the current user
     * 6.4, 7.1, 7.4
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean markAllNotificationsAsRead(@AuthenticationPrincipal User currentUser) {
        log.info("User {} marking all notifications as read", currentUser.getUserID());
        
        notificationService.markAllAsRead(currentUser.getUserID());
        
        log.info("All notifications marked as read for user {}", currentUser.getUserID());
        return true;
    }

    // =======================================================
    // SUBSCRIPTIONS
    // =======================================================

    /**
     * Subscribe to new notifications for the current user
     * 6.1, 6.2, 7.1, 7.4
     */
    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    public Flux<Notification> notificationReceived(@AuthenticationPrincipal User currentUser) {
        log.info("User {} subscribing to notification stream", currentUser.getUserID());
        
        return notificationPublisher.getNotificationStream(currentUser)
                .doOnNext(notification -> log.debug("Delivering notification {} to user {}", 
                        notification.getNotificationID(), currentUser.getUserID()))
                .doOnCancel(() -> log.info("User {} unsubscribed from notification stream", 
                        currentUser.getUserID()));
    }
}
