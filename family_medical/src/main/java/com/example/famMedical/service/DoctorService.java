package com.example.famMedical.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.repository.DoctorAssignmentRepository;
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
            .orElseThrow(() -> new com.example.famMedical.exception.NotFoundException("Member không tồn tại"));
        
        validateDoctorAccessToFamily(doctorId, member.getFamily().getFamilyID());
        
        return medicalRecordRepo.findByMemberMemberID(memberId);
    }



    
    private void validateDoctor(int doctorId) {
        User doctor = userRepo.findById(doctorId)
            .orElseThrow(() -> new com.example.famMedical.exception.NotFoundException("Doctor không tồn tại"));
        
        if (doctor.getRole() != UserRole.BacSi) {
            throw new AuthException("User không phải là doctor");
        }
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
