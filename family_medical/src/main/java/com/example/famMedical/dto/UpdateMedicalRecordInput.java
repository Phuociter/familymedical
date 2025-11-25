package com.example.famMedical.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMedicalRecordInput {
    @NotNull(message = "Record ID is required")
    private Integer recordID;
    
    private String description;
    private String symptoms;
    private String diagnosis;
    private String treatmentPlan;
}
