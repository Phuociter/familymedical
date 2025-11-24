package com.example.famMedical.controller;

import java.util.List;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import com.example.famMedical.dto.Doctor.UpdateDoctorInput;
import com.example.famMedical.dto.Doctor.DoctorDashboard;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.service.DoctorService;
import com.example.famMedical.service.FamilyService;
import com.example.famMedical.service.MemberService;
import com.example.famMedical.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@AllArgsConstructor
@Slf4j
public class DoctorController {

    private final UserService userService;
    
    private DoctorService doctorService;
    private FamilyService familyService;
    private MemberService memberService;


    @QueryMapping
    public List<Family> getDoctorAssignedFamilies(
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
    
    // Doctor Requests GraphQL Resolvers
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public List<DoctorRequest> doctorRequests(
            @AuthenticationPrincipal User user,
            @Argument DoctorRequest.RequestStatus status) {
        log.info("Getting doctor requests for doctor: {}, status: {}", user.getUserID(), status);
        return doctorService.getDoctorRequests(user.getUserID(), status);
    }
    
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public DoctorRequest doctorRequestDetail(
            @AuthenticationPrincipal User user,
            @Argument Integer requestID) {
        log.info("Getting doctor request detail for doctor: {}, requestID: {}", user.getUserID(), requestID);
        return doctorService.getDoctorRequestDetail(requestID, user.getUserID());
    }
    
    
    // Doctor Dashboard Resolver
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public DoctorDashboard doctorDashboard(@AuthenticationPrincipal User user) {
        log.info("Getting dashboard for doctor: {}", user.getUserID());
        return doctorService.getDoctorDashboard(user.getUserID());
    }
    
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public List<Family> assignedFamilies(@AuthenticationPrincipal User user) {
        log.info("Getting assigned families for doctor: {}", user.getUserID());
        return familyService.getAssignedFamilies(user.getUserID());
    }
    
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public Family familyDetail(
            @AuthenticationPrincipal User user,
            @Argument Integer familyID) {
        log.info("Getting family detail for doctor: {}, familyID: {}", user.getUserID(), familyID);
        return familyService.getFamilyDetail(familyID, user.getUserID());
    }
    
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public Member memberDetail(
            @AuthenticationPrincipal User user,
            @Argument Integer memberID) {
        log.info("Getting member detail for doctor: {}, memberID: {}", user.getUserID(), memberID);
        return memberService.getMemberDetail(memberID, user.getUserID());
    }


    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public User updateDoctorProfile(
        @AuthenticationPrincipal User doctor,
        @Argument UpdateDoctorInput input
    ) {
        log.info("Update Doctor Profile, Doctor id: {} with Input: ", doctor.getUserID(), input.toString());
        
        return doctorService.updateDoctorProfile(doctor.getUserID(), input);

    }

}
