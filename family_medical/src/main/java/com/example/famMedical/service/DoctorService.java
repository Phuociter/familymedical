package com.example.famMedical.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.DoctorRequestRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MedicalRecordRepository;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DoctorService {
    private final FamilyRepository familyRepo;
    private final MemberRepository memberRepo;
    private final MedicalRecordRepository medicalRecordRepo; 
    private final UserRepository userRepo;
    private final DoctorAssignmentRepository assignmentRepo;
    private final DoctorRequestRepository doctorRequestRepo;

    public List<Family> getDoctorAssignedFamilies(int doctorId, String search) {
        validateDoctor(doctorId);
        
        if (search != null && !search.trim().isEmpty()) {
            return familyRepo.searchAssignedFamiliesByDoctorId(doctorId, search.trim());
        }
        return familyRepo.findAssignedFamiliesByDoctorId(doctorId);
    }
    
    public List<Member> getFamilyMembers(int doctorId, int familyId) {
        validateDoctor(doctorId);
        validateDoctorAccessToFamily(doctorId, familyId);
        
        return memberRepo.findByFamily_FamilyID(familyId);
    }
    
    public List<MedicalRecord> getMemberMedicalRecords(int doctorId, int memberId) {
        validateDoctor(doctorId);
        
        Member member = memberRepo.findById(memberId)
            .orElseThrow(() -> new NotFoundException("Member không tồn tại"));
        
        validateDoctorAccessToFamily(doctorId, member.getFamily().getFamilyID());
        
        return medicalRecordRepo.findByMemberID_MemberID(memberId);
    }

    // Doctor Request methods
    public List<DoctorRequest> getDoctorRequests(Integer doctorId, DoctorRequest.RequestStatus status) {
        User doctor = validateDoctor(doctorId);
        
        if (status != null) {
            return doctorRequestRepo.findByDoctorAndStatus(doctor, status);
        }
        return doctorRequestRepo.findByDoctor(doctor);
    }
    
    public DoctorRequest getDoctorRequestDetail(Integer requestId, Integer doctorId) {
        DoctorRequest request = doctorRequestRepo.findById(requestId)
            .orElseThrow(() -> new NotFoundException("Doctor request not found"));
            
        if (!request.getDoctor().getUserID().equals(doctorId)) {
            throw new AuthException("Not authorized to view this request");
        }
        
        return request;
    }
    
    public DoctorRequest respondToRequest(Integer requestId, DoctorRequest.RequestStatus status, 
                                         String message, Integer doctorId) {
        DoctorRequest request = getDoctorRequestDetail(requestId, doctorId);
        
        request.setStatus(status);
        request.setResponseMessage(message);
        request.setResponseDate(LocalDateTime.now());
        
        return doctorRequestRepo.save(request);
    }

    
    private User validateDoctor(int doctorId) {
        User doctor = userRepo.findById(doctorId)
            .orElseThrow(() -> new NotFoundException("Doctor không tồn tại"));
        
        if (doctor.getRole() != UserRole.BacSi) {
            throw new AuthException("User không phải là doctor");
        }
        
        return doctor;
    }
    
    private void validateDoctorAccessToFamily(int doctorId, int familyId) {
        Boolean hasAccess = assignmentRepo
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctorId, familyId, AssignmentStatus.ACTIVE);
            
        if (!hasAccess) {
            throw new AuthException("Bạn không có quyền truy cập gia đình này");
        }
    }
}
