package com.example.famMedical.service;


import com.example.famMedical.Entity.DoctorAssignment;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final DoctorAssignmentRepository doctorAssignmentRepository;

    public List<Family> getAllFamilies() {
        return familyRepository.findAll();
    }

    public Optional<Family> getFamilyById(Integer id) {
        return familyRepository.findById(id);
    }

    public Family getFamilyByHeadOfFamilyID(Integer headOfFamilyID){
        return familyRepository.findByHeadOfFamily_UserID(headOfFamilyID);
    }

    public Family createFamily(Family family) {
        return familyRepository.save(family);
    }

    public Family updateFamily(Family family) {
        return familyRepository.save(family);
    }

    public void deleteFamily(Integer id) {
        familyRepository.deleteById(id);
    }

    // New methods for Phase 4
    public List<Family> getAssignedFamilies(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
            .orElseThrow(() -> new NotFoundException("Doctor not found"));
            
        if (doctor.getRole() != UserRole.BacSi) {
            throw new AuthException("User is not a doctor");
        }
        
        return familyRepository.findAssignedFamiliesByDoctorId(doctorId);
    }
    
    public Family getFamilyDetail(Integer familyId, Integer doctorId) {
        Family family = familyRepository.findById(familyId)
            .orElseThrow(() -> new NotFoundException("Family not found"));
            
        // Validate doctor has access to this family
        validateDoctorFamilyAccess(doctorId, familyId);
        
        return family;
    }
    
    public void validateDoctorFamilyAccess(Integer doctorId, Integer familyId) {
        User doctor = userRepository.findById(doctorId)
            .orElseThrow(() -> new NotFoundException("Doctor not found"));
            
        if (doctor.getRole() != UserRole.BacSi) {
            throw new AuthException("User is not a doctor");
        }
        
        Boolean hasAccess = doctorAssignmentRepository
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctorId, familyId, AssignmentStatus.ACTIVE);
            
        if (!hasAccess) {
            throw new AuthException("Not authorized to access this family");
        }
    }
}
