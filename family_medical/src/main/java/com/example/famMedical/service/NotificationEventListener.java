package com.example.famMedical.service;

import com.example.famMedical.dto.events.AppointmentCreatedEvent;
import com.example.famMedical.dto.events.AppointmentUpdatedEvent;
import com.example.famMedical.dto.events.DoctorRequestStatusChangedEvent;
import com.example.famMedical.dto.events.MedicalRecordCreatedEvent;
import com.example.famMedical.dto.events.MedicalRecordUpdatedEvent;
import com.example.famMedical.dto.events.NewMessageEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Event listener component that listens to system events and creates notifications
 * Uses @TransactionalEventListener to ensure notifications are only created after
 * the triggering transaction commits successfully
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {
    
    private final NotificationService notificationService;
    
    /**
     * Listen for appointment creation events and create notifications
     * @param event The appointment created event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleAppointmentCreated(AppointmentCreatedEvent event) {
        log.info("Handling AppointmentCreatedEvent for appointment ID: {}", 
                event.getAppointment().getAppointmentID());
        
        try {
            notificationService.notifyAppointmentCreated(event.getAppointment());
        } catch (Exception e) {
            log.error("Error creating notification for appointment creation: {}", 
                    event.getAppointment().getAppointmentID(), e);
        }
    }
    
    /**
     * Listen for appointment update events and create notifications
     * @param event The appointment updated event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleAppointmentUpdated(AppointmentUpdatedEvent event) {
        log.info("Handling AppointmentUpdatedEvent for appointment ID: {}", 
                event.getAppointment().getAppointmentID());
        
        try {
            notificationService.notifyAppointmentUpdated(event.getAppointment());
        } catch (Exception e) {
            log.error("Error creating notification for appointment update: {}", 
                    event.getAppointment().getAppointmentID(), e);
        }
    }
    
    /**
     * Listen for doctor request status change events and create notifications
     * @param event The doctor request status changed event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleDoctorRequestStatusChanged(DoctorRequestStatusChangedEvent event) {
        log.info("Handling DoctorRequestStatusChangedEvent for request ID: {}", 
                event.getDoctorRequest().getRequestID());
        
        try {
            notificationService.notifyDoctorRequestStatusChanged(event.getDoctorRequest());
        } catch (Exception e) {
            log.error("Error creating notification for doctor request status change: {}", 
                    event.getDoctorRequest().getRequestID(), e);
        }
    }
    
    /**
     * Listen for medical record creation events and create notifications
     * @param event The medical record created event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleMedicalRecordCreated(MedicalRecordCreatedEvent event) {
        log.info("Handling MedicalRecordCreatedEvent for record ID: {}", 
                event.getMedicalRecord().getRecordID());
        
        try {
            notificationService.notifyMedicalRecordCreated(event.getMedicalRecord());
        } catch (Exception e) {
            log.error("Error creating notification for medical record creation: {}", 
                    event.getMedicalRecord().getRecordID(), e);
        }
    }
    
    /**
     * Listen for medical record update events and create notifications
     * @param event The medical record updated event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleMedicalRecordUpdated(MedicalRecordUpdatedEvent event) {
        log.info("Handling MedicalRecordUpdatedEvent for record ID: {}", 
                event.getMedicalRecord().getRecordID());
        
        try {
            notificationService.notifyMedicalRecordUpdated(event.getMedicalRecord());
        } catch (Exception e) {
            log.error("Error creating notification for medical record update: {}", 
                    event.getMedicalRecord().getRecordID(), e);
        }
    }
    
    /**
     * Listen for new message events and create notifications
     * @param event The new message event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleNewMessage(NewMessageEvent event) {
        log.info("Handling NewMessageEvent for message ID: {}", 
                event.getMessage().getMessageID());
        
        try {
            notificationService.notifyNewMessage(event.getMessage());
        } catch (Exception e) {
            log.error("Error creating notification for new message: {}", 
                    event.getMessage().getMessageID(), e);
        }
    }
}
