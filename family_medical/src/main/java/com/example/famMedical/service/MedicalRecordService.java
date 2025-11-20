package com.example.famMedical.service;


import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.repository.MedicalRecordRepository;
import com.example.famMedical.repository.DoctorAssignmentRepository;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;  
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Optional;

@Service
// @RequiredArgsConstructor
@AllArgsConstructor
@Slf4j
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
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

    public MedicalRecord createMedicalRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public MedicalRecord updateRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public void deleteRecord(Integer id) {
        medicalRecordRepository.deleteById(id);
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

        // Return URL (direct or via Cloudinary)
        if (fileRef.startsWith("http://") || fileRef.startsWith("https://")) {
            return fileRef;
        }

        return cloudinaryService.getDownloadUrl(fileRef);
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

}
