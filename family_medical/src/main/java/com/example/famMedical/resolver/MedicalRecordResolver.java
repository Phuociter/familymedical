package com.example.famMedical.resolver;

import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.User;
import com.example.famMedical.service.MedicalRecordService;
import com.example.famMedical.dto.CreateMedicalRecordInput;
import com.example.famMedical.dto.UpdateMedicalRecordInput;

import jakarta.validation.Valid;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class MedicalRecordResolver {
    private final MedicalRecordService medicalRecordService;
    
    public MedicalRecordResolver(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    /**
     * Query: Get medical record detail
     */
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public MedicalRecord medicalRecordDetail(
        @Argument Integer recordID,
        @AuthenticationPrincipal User user
    ) {
        return medicalRecordService.getMedicalRecordDetail(recordID, user.getUserID());
    }

    /**
     * Query: Get recent medical records
     */
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public List<MedicalRecord> recentMedicalRecords(
        @Argument Integer limit,
        @AuthenticationPrincipal User user
    ) {
        return medicalRecordService.getRecentMedicalRecords(user.getUserID(), limit);
    }

    /**
     * Mutation: Create medical record
     */
    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public MedicalRecord createMedicalRecord(
        @Argument @Valid CreateMedicalRecordInput input,
        @AuthenticationPrincipal User user
    ) {
        return medicalRecordService.createMedicalRecord(input, user.getUserID());
    }

    /**
     * Mutation: Update medical record
     */
    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public MedicalRecord updateMedicalRecord(
        @Argument @Valid UpdateMedicalRecordInput input,
        @AuthenticationPrincipal User user
    ) {
        return medicalRecordService.updateMedicalRecord(input, user.getUserID());
    }

    /**
     * Mutation: Delete medical record
     */
    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public Boolean deleteMedicalRecord(
        @Argument Integer recordID,
        @AuthenticationPrincipal User user
    ) {
        return medicalRecordService.deleteMedicalRecord(recordID, user.getUserID());
    }
}
