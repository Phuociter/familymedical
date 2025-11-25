package com.example.famMedical.service;

import com.example.famMedical.Entity.*;
import com.example.famMedical.dto.events.*;
import com.example.famMedical.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test class for NotificationEventListener
 * Verifies that event listeners correctly trigger notification creation
 */
@ExtendWith(MockitoExtension.class)
class NotificationEventListenerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationEventListener eventListener;

    private User doctor;
    private User familyHead;
    private Family family;
    private Member member;
    private Appointment appointment;
    private DoctorRequest doctorRequest;
    private MedicalRecord medicalRecord;
    private Message message;
    private Conversation conversation;

    @BeforeEach
    void setUp() {
        // Setup test data
        doctor = new User();
        doctor.setUserID(1);
        doctor.setFullName("Dr. Test");
        doctor.setRole(UserRole.BacSi);

        familyHead = new User();
        familyHead.setUserID(2);
        familyHead.setFullName("Family Head");
        familyHead.setRole(UserRole.ChuHo);

        family = new Family();
        family.setFamilyID(1);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHead);

        member = new Member();
        member.setMemberID(1);
        member.setFullName("Test Member");
        member.setFamily(family);

        appointment = Appointment.builder()
                .appointmentID(1)
                .doctor(doctor)
                .family(family)
                .member(member)
                .title("Test Appointment")
                .appointmentDateTime(LocalDateTime.now().plusDays(1))
                .duration(30)
                .status(Appointment.AppointmentStatus.SCHEDULED)
                .build();

        doctorRequest = DoctorRequest.builder()
                .requestID(1)
                .doctor(doctor)
                .family(family)
                .status(DoctorRequest.RequestStatus.ACCEPTED)
                .build();

        medicalRecord = MedicalRecord.builder()
                .recordID(1)
                .member(member)
                .doctor(doctor)
                .description("Test Record")
                .build();

        conversation = Conversation.builder()
                .conversationID(1L)
                .doctor(doctor)
                .family(family)
                .build();

        message = Message.builder()
                .messageID(1L)
                .conversation(conversation)
                .sender(doctor)
                .content("Test message")
                .build();
    }

    @Test
    void testHandleAppointmentCreated() {
        // Given
        AppointmentCreatedEvent event = new AppointmentCreatedEvent(this, appointment);

        // When
        eventListener.handleAppointmentCreated(event);

        // Then
        verify(notificationService, times(1)).notifyAppointmentCreated(appointment);
    }

    @Test
    void testHandleAppointmentUpdated() {
        // Given
        AppointmentUpdatedEvent event = new AppointmentUpdatedEvent(this, appointment);

        // When
        eventListener.handleAppointmentUpdated(event);

        // Then
        verify(notificationService, times(1)).notifyAppointmentUpdated(appointment);
    }

    @Test
    void testHandleDoctorRequestStatusChanged() {
        // Given
        DoctorRequestStatusChangedEvent event = new DoctorRequestStatusChangedEvent(this, doctorRequest);

        // When
        eventListener.handleDoctorRequestStatusChanged(event);

        // Then
        verify(notificationService, times(1)).notifyDoctorRequestStatusChanged(doctorRequest);
    }

    @Test
    void testHandleMedicalRecordCreated() {
        // Given
        MedicalRecordCreatedEvent event = new MedicalRecordCreatedEvent(this, medicalRecord);

        // When
        eventListener.handleMedicalRecordCreated(event);

        // Then
        verify(notificationService, times(1)).notifyMedicalRecordCreated(medicalRecord);
    }

    @Test
    void testHandleMedicalRecordUpdated() {
        // Given
        MedicalRecordUpdatedEvent event = new MedicalRecordUpdatedEvent(this, medicalRecord);

        // When
        eventListener.handleMedicalRecordUpdated(event);

        // Then
        verify(notificationService, times(1)).notifyMedicalRecordUpdated(medicalRecord);
    }

    @Test
    void testHandleNewMessage() {
        // Given
        NewMessageEvent event = new NewMessageEvent(this, message);

        // When
        eventListener.handleNewMessage(event);

        // Then
        verify(notificationService, times(1)).notifyNewMessage(message);
    }

    @Test
    void testHandleAppointmentCreatedWithException() {
        // Given
        AppointmentCreatedEvent event = new AppointmentCreatedEvent(this, appointment);
        doThrow(new RuntimeException("Test exception"))
                .when(notificationService).notifyAppointmentCreated(any());

        // When - should not throw exception
        eventListener.handleAppointmentCreated(event);

        // Then - verify the method was called despite the exception
        verify(notificationService, times(1)).notifyAppointmentCreated(appointment);
    }

    @Test
    void testHandleNewMessageWithException() {
        // Given
        NewMessageEvent event = new NewMessageEvent(this, message);
        doThrow(new RuntimeException("Test exception"))
                .when(notificationService).notifyNewMessage(any());

        // When - should not throw exception
        eventListener.handleNewMessage(event);

        // Then - verify the method was called despite the exception
        verify(notificationService, times(1)).notifyNewMessage(message);
    }
}
