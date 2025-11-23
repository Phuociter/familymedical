package com.example.famMedical.service;


import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.dto.CreateMedicalRecordInput;
import com.example.famMedical.dto.UpdateMedicalRecordInput;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.exception.ValidationException;
import com.example.famMedical.repository.MedicalRecordRepository;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.UserRepository;
import com.example.famMedical.repository.DoctorAssignmentRepository;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;  
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Slf4j
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final DoctorAssignmentRepository doctorAssignmentRepository;
    private final CloudinaryService cloudinaryService;

    public List<MedicalRecord> getAllRecords() {
        return medicalRecordRepository.findAll();
    }

    public Optional<MedicalRecord> getRecordById(Integer id) {
        return medicalRecordRepository.findById(id);
    }

    public List<MedicalRecord> getRecordsByMemberId(Integer memberId) {
        return medicalRecordRepository.findByMember_MemberID(memberId);
    }

    // Trả về chỉ danh sách link file PDF
    public List<String> getFileLinksByMemberId(Integer memberId) {
        return medicalRecordRepository.findFileLinksByMember_MemberID(memberId);
    }

    /**
     * Get member medical records with access validation
     */
    public List<MedicalRecord> getMemberMedicalRecords(Integer doctorId, Integer memberId) {
        User doctor = validateDoctor(doctorId);
        
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new NotFoundException("Member not found"));
        
        validateDoctorAccessToFamily(doctor, member.getFamily().getFamilyID());
        
        return medicalRecordRepository.findByMemberOrderByUploadDateDesc(member);
    }

    /**
     * Get medical record detail with access validation
     */
    public MedicalRecord getMedicalRecordDetail(Integer recordId, Integer doctorId) {
        User doctor = validateDoctor(doctorId);
        
        MedicalRecord record = medicalRecordRepository.findById(recordId)
            .orElseThrow(() -> new NotFoundException("Medical record not found"));
        
        validateDoctorAccessToFamily(doctor, record.getMember().getFamily().getFamilyID());
        
        return record;
    }

    /**
     * Get recent medical records with limit
     */
    public List<MedicalRecord> getRecentMedicalRecords(Integer doctorId, Integer limit) {
        User doctor = validateDoctor(doctorId);
        
        int recordLimit = (limit != null && limit > 0) ? limit : 10;
        
        return medicalRecordRepository.findTopNByDoctorOrderByUploadDateDesc(doctor, recordLimit);
    }

    /**
     * Create medical record with validation
     */
    public MedicalRecord createMedicalRecord(CreateMedicalRecordInput input, Integer doctorId) {
        User doctor = validateDoctor(doctorId);
        
        Member member = memberRepository.findById(input.getMemberID())
            .orElseThrow(() -> new NotFoundException("Member not found"));
        
        validateDoctorAccessToFamily(doctor, member.getFamily().getFamilyID());
        
        // Validate file link and name
        if (input.getFileLink() == null || input.getFileLink().isBlank()) {
            throw new ValidationException("File link is required");
        }
        if (input.getFileName() == null || input.getFileName().isBlank()) {
            throw new ValidationException("File name is required");
        }
        
        MedicalRecord record = MedicalRecord.builder()
            .member(member)
            .doctor(doctor)
            .fileType(input.getFileType())
            .fileLink(input.getFileLink())
            .description(input.getDescription())
            .symptoms(input.getSymptoms())
            .diagnosis(input.getDiagnosis())
            .treatmentPlan(input.getTreatmentPlan())
            .uploadDate(LocalDateTime.now())
            .build();
        
        return medicalRecordRepository.save(record);
    }

    /**
     * Update medical record
     */
    public MedicalRecord updateMedicalRecord(UpdateMedicalRecordInput input, Integer doctorId) {
        User doctor = validateDoctor(doctorId);
        
        MedicalRecord record = medicalRecordRepository.findById(input.getRecordID())
            .orElseThrow(() -> new NotFoundException("Medical record not found"));
        
        // Validate doctor has access to the family
        validateDoctorAccessToFamily(doctor, record.getMember().getFamily().getFamilyID());
        
        // Validate doctor is the creator or has access
        if (!record.getDoctor().getUserID().equals(doctorId)) {
            throw new AuthException("Only the doctor who created the record can update it");
        }
        
        // Update fields
        if (input.getDescription() != null) {
            record.setDescription(input.getDescription());
        }
        if (input.getSymptoms() != null) {
            record.setSymptoms(input.getSymptoms());
        }
        if (input.getDiagnosis() != null) {
            record.setDiagnosis(input.getDiagnosis());
        }
        if (input.getTreatmentPlan() != null) {
            record.setTreatmentPlan(input.getTreatmentPlan());
        }
        
        return medicalRecordRepository.save(record);
    }

    /**
     * Delete medical record
     */
    public boolean deleteMedicalRecord(Integer recordId, Integer doctorId) {
        User doctor = validateDoctor(doctorId);
        
        MedicalRecord record = medicalRecordRepository.findById(recordId)
            .orElseThrow(() -> new NotFoundException("Medical record not found"));
        
        // Validate doctor has access to the family
        validateDoctorAccessToFamily(doctor, record.getMember().getFamily().getFamilyID());
        
        // Validate doctor is the creator
        if (!record.getDoctor().getUserID().equals(doctorId)) {
            throw new AuthException("Only the doctor who created the record can delete it");
        }
        
        medicalRecordRepository.deleteById(recordId);
        return true;
    }

    // Legacy method - kept for backward compatibility
    public MedicalRecord createMedicalRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public MedicalRecord updateRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public Boolean deleteMedicalRecord(Integer id) {
        medicalRecordRepository.deleteById(id);
        return true;
    }

    /**
     * Get download URL for a medical record if the user has permission.
     *
     * @param user The authenticated user
     * @param recordId The medical record ID
     * @return The download URL (direct URL or Cloudinary URL)
     * @throws ResponseStatusException with 400, 404, 403, or 500 status codes
     */
    public String getDownloadUrl(User user, Integer recordId) {
        log.info("Getting download URL for user: {}, recordId: {}", user.getUserID(), recordId);

        // Fetch the record
        MedicalRecord record = medicalRecordRepository.findById(recordId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));

        // Ensure record is linked to a member and family
        if (record.getMember() == null || record.getMember().getFamily() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Family not found for this record");
        }

        // Check permission
        boolean allowed = canUserDownloadRecord(user, record);
        if (!allowed) {
            log.warn("User {} attempted to download record {} but was forbidden", user.getUserID(), recordId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền tải file này");
        }

        // Get file link
        String fileRef = record.getFileLink();
        if (fileRef == null || fileRef.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File not available");
        }

        // Return signed URL from Cloudinary
        // If fileRef is already a full URL, extract the public_id
        String publicId = extractPublicIdFromUrl(fileRef);
        
        // Generate signed URL with 1 hour expiration
        return cloudinaryService.getSignedDownloadUrl(publicId, 3600);
    }

    /**
     * Check if a user has permission to download a medical record.
     * 
     * Rules:
     * - BacSi (Doctor): Must have an ACTIVE assignment to the family
     * - Admin: Always allowed
     * - ChuHo (Head of Family): Allowed if they are the head of the family
     * - Others: Not allowed
     *
     * @param user The authenticated user
     * @param record The medical record
     * @return true if allowed, false otherwise
     */
    public boolean canUserDownloadRecord(User user, MedicalRecord record) {
        Integer familyId = record.getMember().getFamily().getFamilyID();

        switch (user.getRole()) {
            case BacSi:
                // Doctor must have an ACTIVE assignment to the family
                return doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                    user.getUserID(), familyId, AssignmentStatus.ACTIVE
                );

            case Admin:
                // Admin always allowed
                return true;

            case ChuHo:
                // Head of family allowed if they are the head of this family
                if (record.getMember().getFamily().getHeadOfFamily() != null
                    && record.getMember().getFamily().getHeadOfFamily().getUserID().equals(user.getUserID())) {
                    return true;
                }
                return false;

            default:
                return false;
        }
    }

    /**
     * Extract Cloudinary public_id from URL or return as-is if already a public_id
     * 
     * Examples:
     * - Input: "https://res.cloudinary.com/demo/image/upload/v1234567890/user123/medical.pdf"
     * - Output: "user123/medical.pdf"
     * 
     * - Input: "user123/medical.pdf"
     * - Output: "user123/medical.pdf"
     */
    private String extractPublicIdFromUrl(String fileRef) {
        if (fileRef == null || fileRef.isBlank()) {
            throw new ValidationException("File reference is empty");
        }
        
        // If it's already a public_id (no http/https), return as-is
        if (!fileRef.startsWith("http://") && !fileRef.startsWith("https://")) {
            return fileRef;
        }
        
        // Extract public_id from Cloudinary URL
        // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
        try {
            String[] parts = fileRef.split("/upload/");
            if (parts.length < 2) {
                throw new ValidationException("Invalid Cloudinary URL format");
            }
            
            // Remove version prefix (v1234567890/) if exists
            String afterUpload = parts[1];
            if (afterUpload.matches("^v\\d+/.*")) {
                afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
            }
            
            // Remove file extension
            int lastDot = afterUpload.lastIndexOf('.');
            if (lastDot > 0) {
                afterUpload = afterUpload.substring(0, lastDot);
            }
            
            return afterUpload;
        } catch (Exception e) {
            log.error("Failed to extract public_id from URL: {}", fileRef, e);
            throw new ValidationException("Cannot extract public_id from Cloudinary URL");
        }
    }

    /**
     * Validate that the user is a doctor
     */
    private User validateDoctor(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
            .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        if (doctor.getRole() != UserRole.BacSi) {
            throw new AuthException("User is not a doctor");
        }
        
        return doctor;
    }

    /**
     * Validate that the doctor has access to the family
     */
    private void validateDoctorAccessToFamily(User doctor, Integer familyId) {
        boolean hasAccess = doctorAssignmentRepository
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), familyId, AssignmentStatus.ACTIVE);
        
        if (!hasAccess) {
            throw new AuthException("Doctor does not have access to this family");
        }
    }

}
