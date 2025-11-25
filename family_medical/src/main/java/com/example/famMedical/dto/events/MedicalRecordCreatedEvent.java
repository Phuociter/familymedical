package com.example.famMedical.dto.events;

import com.example.famMedical.Entity.MedicalRecord;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a new medical record is created
 */
@Getter
public class MedicalRecordCreatedEvent extends ApplicationEvent {
    
    private final MedicalRecord medicalRecord;
    
    public MedicalRecordCreatedEvent(Object source, MedicalRecord medicalRecord) {
        super(source);
        this.medicalRecord = medicalRecord;
    }
}
