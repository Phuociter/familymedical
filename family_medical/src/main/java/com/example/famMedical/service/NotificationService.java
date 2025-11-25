package com.example.famMedical.service;

import com.example.famMedical.Entity.Appointment;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Message;
import com.example.famMedical.Entity.Notification;
import com.example.famMedical.Entity.NotificationType;
import com.example.famMedical.dto.NotificationConnection;

public interface NotificationService {
    
    /**
     * Create a notification for a user
     * @param userID The ID of the user to receive the notification
     * @param type The type of notification
     * @param title The notification title
     * @param message The notification message
     * @param relatedEntityType The type of related entity (e.g., "Appointment", "DoctorRequest")
     * @param relatedEntityID The ID of the related entity
     * @return The created notification
     */
    Notification createNotification(Integer userID, NotificationType type, 
                                   String title, String message,
                                   String relatedEntityType, Long relatedEntityID);
    
    /**
     * Mark a notification as read
     * @param notificationID The ID of the notification to mark as read
     * @param userID The ID of the user (for authorization)
     * @return The updated notification
     */
    Notification markAsRead(Long notificationID, Integer userID);
    
    /**
     * Mark all notifications as read for a user
     * @param userID The ID of the user
     */
    void markAllAsRead(Integer userID);
    
    /**
     * Get notifications for a user with pagination
     * @param userID The ID of the user
     * @param page The page number (0-indexed)
     * @param size The page size
     * @return NotificationConnection with notifications and pagination info
     */
    NotificationConnection getUserNotifications(Integer userID, int page, int size);
    
    /**
     * Get the count of unread notifications for a user
     * @param userID The ID of the user
     * @return The count of unread notifications
     */
    int getUnreadNotificationCount(Integer userID);
    
    // Event-triggered notification creators
    
    /**
     * Create notification when an appointment is created
     * @param appointment The created appointment
     */
    void notifyAppointmentCreated(Appointment appointment);
    
    /**
     * Create notification when an appointment is updated
     * @param appointment The updated appointment
     */
    void notifyAppointmentUpdated(Appointment appointment);
    
    /**
     * Create notification when a doctor request status changes
     * @param request The doctor request with updated status
     */
    void notifyDoctorRequestStatusChanged(DoctorRequest request);
    
    /**
     * Create notification when a medical record is created
     * @param record The created medical record
     */
    void notifyMedicalRecordCreated(MedicalRecord record);
    
    /**
     * Create notification when a medical record is updated
     * @param record The updated medical record
     */
    void notifyMedicalRecordUpdated(MedicalRecord record);
    
    /**
     * Create notification when a new message is received
     * @param message The received message
     */
    void notifyNewMessage(Message message);
}
