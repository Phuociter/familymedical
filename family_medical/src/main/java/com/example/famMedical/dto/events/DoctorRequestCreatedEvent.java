package com.example.famMedical.dto.events;

import com.example.famMedical.Entity.DoctorRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a doctor request is created
 */
@Getter
public class DoctorRequestCreatedEvent extends ApplicationEvent {
    
    private final DoctorRequest doctorRequest;
    
    public DoctorRequestCreatedEvent(Object source, DoctorRequest doctorRequest) {
        super(source);
        this.doctorRequest = doctorRequest;
    }
}

