package com.example.famMedical.dto;

import com.example.famMedical.Entity.MedicalRecord.FileType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMedicalRecordInput {
    @NotNull(message = "Member ID is required")
    private Integer memberID;
    
    private FileType fileType;
    
    @NotBlank(message = "File link is required")
    private String fileLink;
    
    @NotBlank(message = "File name is required")
    private String fileName;
    
    private Integer fileSize;
    
    private String description;
    private String symptoms;
    private String diagnosis;
    private String treatmentPlan;
}
