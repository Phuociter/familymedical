package com.example.famMedical.controller;

import java.util.List;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.ContextValue;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.service.DoctorService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@AllArgsConstructor
@Slf4j
public class DoctorController {
    
    private DoctorService doctorService;

    @QueryMapping
    public List<Family> doctorAssignedFamilies(
            @AuthenticationPrincipal User user,
            @Argument String search) {
        
        log.info("Getting assigned families for doctor: {}, search: {}", user.getUserID(), search);
        return doctorService.getDoctorAssignedFamilies(user.getUserID(), search);
    }
    
    @QueryMapping
    public List<Member> familyMembers(
            @AuthenticationPrincipal User user,
            @Argument int familyId) {
        log.info("Getting family members for doctor: {}, family: {}", user.getUserID(), familyId);
        return doctorService.getFamilyMembers(user.getUserID(), familyId);
    }
    
    @QueryMapping
    public List<MedicalRecord> memberMedicalRecords(
            @AuthenticationPrincipal User user,
            @Argument int memberId) {
        log.info("Getting medical records for doctor: {}, member: {}", user.getUserID(), memberId);
        return doctorService.getMemberMedicalRecords(user.getUserID(), memberId);
    }
    
    // @QueryMapping
    // public List<DoctorRequest> pendingDoctorRequests(@ContextValue int userId) {
    //     log.info("Getting pending requests for doctor: {}", userId);
    //     return doctorService.getPendingDoctorRequests(userId);
    // }
}
