package com.example.famMedical.dto.events;

import com.example.famMedical.Entity.MedicalRecord;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a medical record is updated
 */
@Getter
public class MedicalRecordUpdatedEvent extends ApplicationEvent {
    
    private final MedicalRecord medicalRecord;
    
    public MedicalRecordUpdatedEvent(Object source, MedicalRecord medicalRecord) {
        super(source);
        this.medicalRecord = medicalRecord;
    }
}
