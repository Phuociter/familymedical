package com.example.famMedical.service;

import com.example.famMedical.Entity.Appointment;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Message;
import com.example.famMedical.Entity.Notification;
import com.example.famMedical.Entity.NotificationType;
import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.NotificationConnection;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.exception.UnAuthorizedException;
import com.example.famMedical.repository.NotificationRepository;
import com.example.famMedical.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationPublisher notificationPublisher;
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Transactional
    public Notification createNotification(Integer userID, NotificationType type,
                                          String title, String message,
                                          String relatedEntityType, Long relatedEntityID) {
        log.info("Creating notification for user {} with type {}", userID, type);
        
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + userID));
        
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityType(relatedEntityType)
                .relatedEntityID(relatedEntityID)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", savedNotification.getNotificationID());
        
        // Publish notification to subscribers
        notificationPublisher.publishNotification(savedNotification);
        log.debug("Notification {} published to subscribers", savedNotification.getNotificationID());
        
        return savedNotification;
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationID, Integer userID) {
        log.info("Marking notification {} as read for user {}", notificationID, userID);
        
        Notification notification = notificationRepository.findById(notificationID)
                .orElseThrow(() -> new NotFoundException("Notification not found with ID: " + notificationID));
        
        // Verify the notification belongs to the user (Requirement 7.4 - Notification ownership verification)
        if (!notification.getUser().getUserID().equals(userID)) {
            log.warn("Unauthorized access attempt: User {} tried to mark notification {} belonging to user {}", 
                    userID, notificationID, notification.getUser().getUserID());
            throw new UnAuthorizedException("You do not have permission to access this notification");
        }
        
        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
            log.info("Notification {} marked as read", notificationID);
        }
        
        return notification;
    }

    @Override
    @Transactional
    public void markAllAsRead(Integer userID) {
        log.info("Marking all notifications as read for user {}", userID);
        
        int updatedCount = notificationRepository.markAllAsReadByUser(userID, LocalDateTime.now());
        log.info("Marked {} notifications as read for user {}", updatedCount, userID);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationConnection getUserNotifications(Integer userID, int page, int size) {
        log.info("Fetching notifications for user {} - page: {}, size: {}", userID, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findByUserID(userID, pageable);
        
        NotificationConnection connection = new NotificationConnection(
                notificationPage.getContent(),
                notificationPage.getTotalElements(),
                notificationPage.hasNext()
        );
        
        log.info("Retrieved {} notifications for user {}", notificationPage.getContent().size(), userID);
        return connection;
    }

    @Override
    @Transactional(readOnly = true)
    public int getUnreadNotificationCount(Integer userID) {
        log.info("Fetching unread notification count for user {}", userID);
        
        int count = notificationRepository.countUnreadByUser(userID);
        log.info("User {} has {} unread notifications", userID, count);
        
        return count;
    }

    @Override
    @Transactional
    public void notifyAppointmentCreated(Appointment appointment) {
        log.info("Creating notifications for appointment creation: {}", appointment.getAppointmentID());
        
        // Notify the doctor
        String doctorTitle = "Cuộc hẹn mới được tạo";
        String doctorMessage = String.format(
                "Cuộc hẹn mới với %s đã được tạo vào %s",
                appointment.getFamily().getFamilyName(),
                appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER)
        );
        createNotification(
                appointment.getDoctor().getUserID(),
                NotificationType.APPOINTMENT_CREATED,
                doctorTitle,
                doctorMessage,
                "Appointment",
                appointment.getAppointmentID().longValue()
        );
        
        // Notify the family head
        if (appointment.getFamily().getHeadOfFamily() != null) {
            String familyTitle = "Cuộc hẹn mới được tạo";
            String familyMessage = String.format(
                    "Cuộc hẹn với bác sĩ %s đã được tạo vào %s",
                    appointment.getDoctor().getFullName(),
                    appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER)
            );
            createNotification(
                    appointment.getFamily().getHeadOfFamily().getUserID(),
                    NotificationType.APPOINTMENT_CREATED,
                    familyTitle,
                    familyMessage,
                    "Appointment",
                    appointment.getAppointmentID().longValue()
            );
        }
        
        log.info("Appointment creation notifications sent");
    }

    @Override
    @Transactional
    public void notifyAppointmentUpdated(Appointment appointment) {
        log.info("Creating notifications for appointment update: {}", appointment.getAppointmentID());
        
        // Notify the doctor
        String doctorTitle = "Cuộc hẹn được cập nhật";
        String doctorMessage = String.format(
                "Cuộc hẹn với %s vào %s đã được cập nhật",
                appointment.getFamily().getFamilyName(),
                appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER)
        );
        createNotification(
                appointment.getDoctor().getUserID(),
                NotificationType.APPOINTMENT_UPDATED,
                doctorTitle,
                doctorMessage,
                "Appointment",
                appointment.getAppointmentID().longValue()
        );
        
        // Notify the family head
        if (appointment.getFamily().getHeadOfFamily() != null) {
            String familyTitle = "Cuộc hẹn được cập nhật";
            String familyMessage = String.format(
                    "Cuộc hẹn với bác sĩ %s vào %s đã được cập nhật",
                    appointment.getDoctor().getFullName(),
                    appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER)
            );
            createNotification(
                    appointment.getFamily().getHeadOfFamily().getUserID(),
                    NotificationType.APPOINTMENT_UPDATED,
                    familyTitle,
                    familyMessage,
                    "Appointment",
                    appointment.getAppointmentID().longValue()
            );
        }
        
        log.info("Appointment update notifications sent");
    }

    @Override
    @Transactional
    public void notifyDoctorRequestStatusChanged(DoctorRequest request) {
        log.info("Creating notification for doctor request status change: {}", request.getRequestID());
        
        String title;
        String message;
        NotificationType type;
        
        switch (request.getStatus()) {
            case ACCEPTED:
                title = "Yêu cầu bác sĩ được chấp nhận";
                message = String.format(
                        "Bác sĩ %s đã chấp nhận yêu cầu của bạn",
                        request.getDoctor().getFullName()
                );
                type = NotificationType.DOCTOR_REQUEST_ACCEPTED;
                break;
            case REJECTED:
                title = "Yêu cầu bác sĩ bị từ chối";
                message = String.format(
                        "Bác sĩ %s đã từ chối yêu cầu của bạn",
                        request.getDoctor().getFullName()
                );
                type = NotificationType.DOCTOR_REQUEST_REJECTED;
                break;
            default:
                log.warn("Unexpected doctor request status: {}", request.getStatus());
                return;
        }
        
        // Notify the family head
        if (request.getFamily().getHeadOfFamily() != null) {
            createNotification(
                    request.getFamily().getHeadOfFamily().getUserID(),
                    type,
                    title,
                    message,
                    "DoctorRequest",
                    request.getRequestID().longValue()
            );
            log.info("Doctor request status change notification sent: {}", title);
        } else {
            log.warn("Cannot send notification - family has no head of family");
        }
    }

    @Override
    @Transactional
    public void notifyMedicalRecordCreated(MedicalRecord record) {
        log.info("Creating notification for medical record creation: {}", record.getRecordID());
        
        // Notify the family head
        String title = "Hồ sơ y tế mới";
        String message = String.format(
                "Hồ sơ y tế mới cho %s đã được tạo",
                record.getMember().getFullName()
        );
        
        if (record.getMember().getFamily().getHeadOfFamily() != null) {
            createNotification(
                    record.getMember().getFamily().getHeadOfFamily().getUserID(),
                    NotificationType.MEDICAL_RECORD_CREATED,
                    title,
                    message,
                    "MedicalRecord",
                    record.getRecordID().longValue()
            );
            log.info("Medical record creation notification sent");
        } else {
            log.warn("Cannot send notification - family has no head of family");
        }
    }

    @Override
    @Transactional
    public void notifyMedicalRecordUpdated(MedicalRecord record) {
        log.info("Creating notification for medical record update: {}", record.getRecordID());
        
        String title = "Hồ sơ y tế được cập nhật";
        String message = String.format(
                "Hồ sơ y tế của %s đã được cập nhật",
                record.getMember().getFullName()
        );
        
        if (record.getMember().getFamily().getHeadOfFamily() != null) {
            createNotification(
                    record.getMember().getFamily().getHeadOfFamily().getUserID(),
                    NotificationType.MEDICAL_RECORD_UPDATED,
                    title,
                    message,
                    "MedicalRecord",
                    record.getRecordID().longValue()
            );
            log.info("Medical record update notification sent");
        } else {
            log.warn("Cannot send notification - family has no head of family");
        }
    }

    @Override
    @Transactional
    public void notifyNewMessage(Message message) {
        log.info("Creating notification for new message: {}", message.getMessageID());
        
        // Determine the recipient (the user who is not the sender)
        Integer recipientID;
        String senderName = message.getSender().getFullName();
        
        // Get the conversation to determine the recipient
        if (message.getConversation().getDoctor().getUserID().equals(message.getSender().getUserID())) {
            // Sender is the doctor, notify the family head
            if (message.getConversation().getFamily().getHeadOfFamily() != null) {
                recipientID = message.getConversation().getFamily().getHeadOfFamily().getUserID();
            } else {
                log.warn("Cannot send notification - family has no head of family");
                return;
            }
        } else {
            // Sender is from family, notify the doctor
            recipientID = message.getConversation().getDoctor().getUserID();
        }
        
        String title = "Tin nhắn mới";
        String messageText = String.format(
                "Bạn có tin nhắn mới từ %s",
                senderName
        );
        
        createNotification(
                recipientID,
                NotificationType.NEW_MESSAGE,
                title,
                messageText,
                "Message",
                message.getMessageID()
        );
        
        log.info("New message notification sent to user {}", recipientID);
    }
}
