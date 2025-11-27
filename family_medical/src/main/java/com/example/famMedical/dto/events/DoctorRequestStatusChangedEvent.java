package com.example.famMedical.dto.events;

import com.example.famMedical.Entity.DoctorRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a doctor request status changes
 */
@Getter
public class DoctorRequestStatusChangedEvent extends ApplicationEvent {
    
    private final DoctorRequest doctorRequest;
    
    public DoctorRequestStatusChangedEvent(Object source, DoctorRequest doctorRequest) {
        super(source);
        this.doctorRequest = doctorRequest;
    }
}
