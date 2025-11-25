package com.example.famMedical.dto.events;

import com.example.famMedical.Entity.Appointment;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a new appointment is created
 */
@Getter
public class AppointmentCreatedEvent extends ApplicationEvent {
    
    private final Appointment appointment;
    
    public AppointmentCreatedEvent(Object source, Appointment appointment) {
        super(source);
        this.appointment = appointment;
    }
}
