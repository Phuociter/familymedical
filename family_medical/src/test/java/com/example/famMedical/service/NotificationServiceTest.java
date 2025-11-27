package com.example.famMedical.service;

import com.example.famMedical.Entity.*;
import com.example.famMedical.dto.NotificationConnection;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.exception.UnAuthorizedException;
import com.example.famMedical.repository.NotificationRepository;
import com.example.famMedical.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationPublisher notificationPublisher;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserID(1);
        testUser.setFullName("Test User");
        testUser.setEmail("test@example.com");

        testNotification = Notification.builder()
                .notificationID(1L)
                .user(testUser)
                .type(NotificationType.APPOINTMENT_CREATED)
                .title("Test Notification")
                .message("Test message")
                .relatedEntityType("Appointment")
                .relatedEntityID(1)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateNotification_Success() {
        // Arrange
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification result = notificationService.createNotification(
                1,
                NotificationType.APPOINTMENT_CREATED,
                "Test Notification",
                "Test message",
                "Appointment",
                1
        );

        // Assert
        assertNotNull(result);
        assertEquals("Test Notification", result.getTitle());
        assertEquals("Test message", result.getMessage());
        assertEquals(NotificationType.APPOINTMENT_CREATED, result.getType());
        verify(userRepository).findById(1);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void testCreateNotification_UserNotFound() {
        // Arrange
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            notificationService.createNotification(
                    999,
                    NotificationType.APPOINTMENT_CREATED,
                    "Test",
                    "Test",
                    "Appointment",
                    1
            );
        });
    }

    @Test
    void testMarkAsRead_Success() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification result = notificationService.markAsRead(1L, 1);

        // Assert
        assertNotNull(result);
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void testMarkAsRead_NotificationNotFound() {
        // Arrange
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            notificationService.markAsRead(999L, 1);
        });
    }

    @Test
    void testMarkAsRead_UnauthorizedUser() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        // Act & Assert
        assertThrows(UnAuthorizedException.class, () -> {
            notificationService.markAsRead(1L, 999);
        });
    }

    @Test
    void testMarkAllAsRead_Success() {
        // Arrange
        when(notificationRepository.markAllAsReadByUser(eq(1), any(LocalDateTime.class))).thenReturn(5);

        // Act
        notificationService.markAllAsRead(1);

        // Assert
        verify(notificationRepository).markAllAsReadByUser(eq(1), any(LocalDateTime.class));
    }

    @Test
    void testGetUserNotifications_Success() {
        // Arrange
        List<Notification> notifications = Arrays.asList(testNotification);
        Page<Notification> page = new PageImpl<>(notifications, Pageable.ofSize(10), 1);
        when(notificationRepository.findByUserID(eq(1), any(Pageable.class))).thenReturn(page);

        // Act
        NotificationConnection result = notificationService.getUserNotifications(1, 0, 10);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getNotifications().size());
        assertEquals(1, result.getTotalCount());
        assertFalse(result.isHasMore());
        verify(notificationRepository).findByUserID(eq(1), any(Pageable.class));
    }

    @Test
    void testGetUnreadNotificationCount_Success() {
        // Arrange
        when(notificationRepository.countUnreadByUser(1)).thenReturn(3);

        // Act
        int result = notificationService.getUnreadNotificationCount(1);

        // Assert
        assertEquals(3, result);
        verify(notificationRepository).countUnreadByUser(1);
    }

    @Test
    void testNotifyAppointmentCreated_Success() {
        // Arrange
        User doctor = new User();
        doctor.setUserID(1);
        doctor.setFullName("Dr. Smith");

        User familyHead = new User();
        familyHead.setUserID(2);
        familyHead.setFullName("Family Head");

        Family family = new Family();
        family.setFamilyID(1);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHead);

        Appointment appointment = new Appointment();
        appointment.setAppointmentID(1);
        appointment.setDoctor(doctor);
        appointment.setFamily(family);
        appointment.setAppointmentDateTime(LocalDateTime.now());

        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.notifyAppointmentCreated(appointment);

        // Assert - CHỈ gửi notification cho Family (Doctor tự tạo nên không nhận notification)
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testNotifyDoctorRequestStatusChanged_Accepted() {
        // Arrange
        User doctor = new User();
        doctor.setUserID(1);
        doctor.setFullName("Dr. Smith");

        User familyHead = new User();
        familyHead.setUserID(2);
        familyHead.setFullName("Family Head");

        Family family = new Family();
        family.setFamilyID(1);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHead);

        DoctorRequest request = new DoctorRequest();
        request.setRequestID(1);
        request.setDoctor(doctor);
        request.setFamily(family);
        request.setStatus(DoctorRequest.RequestStatus.ACCEPTED);

        when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.notifyDoctorRequestStatusChanged(request);

        // Assert
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void testNotifyMedicalRecordCreated_Success() {
        // Arrange
        User familyHead = new User();
        familyHead.setUserID(1);
        familyHead.setFullName("Family Head");

        Family family = new Family();
        family.setFamilyID(1);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHead);

        Member member = new Member();
        member.setMemberID(1);
        member.setFullName("Test Member");
        member.setFamily(family);

        MedicalRecord record = new MedicalRecord();
        record.setRecordID(1);
        record.setMember(member);

        when(userRepository.findById(1)).thenReturn(Optional.of(familyHead));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.notifyMedicalRecordCreated(record);

        // Assert
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void testNotifyNewMessage_DoctorToFamily() {
        // Arrange
        User doctor = new User();
        doctor.setUserID(1);
        doctor.setFullName("Dr. Smith");

        User familyHead = new User();
        familyHead.setUserID(2);
        familyHead.setFullName("Family Head");

        Family family = new Family();
        family.setFamilyID(1);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHead);

        Conversation conversation = new Conversation();
        conversation.setConversationID(1);
        conversation.setDoctor(doctor);
        conversation.setFamily(family);

        Message message = new Message();
        message.setMessageID(1);
        message.setSender(doctor);
        message.setConversation(conversation);
        message.setContent("Test message");

        when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.notifyNewMessage(message);

        // Assert
        verify(notificationRepository).save(any(Notification.class));
    }
}
