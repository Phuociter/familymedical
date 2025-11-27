package com.example.famMedical.dto.events;

import com.example.famMedical.Entity.Appointment;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when an appointment is updated
 */
@Getter
public class AppointmentUpdatedEvent extends ApplicationEvent {
    
    private final Appointment appointment;
    
    public AppointmentUpdatedEvent(Object source, Appointment appointment) {
        super(source);
        this.appointment = appointment;
    }
}
