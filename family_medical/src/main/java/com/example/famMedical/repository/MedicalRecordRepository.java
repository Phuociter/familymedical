
package com.example.famMedical.repository;

import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    
    // Legacy method - kept for backward compatibility
    @Query("SELECT m FROM MedicalRecord m WHERE m.member.memberID = :memberID ORDER BY m.uploadDate DESC")
    List<MedicalRecord> findByMember_MemberID(@Param("memberID") Integer memberID);

    // New method with proper naming
    List<MedicalRecord> findByMemberOrderByUploadDateDesc(Member member);
    List<MedicalRecord> findByDoctor_UserID(Integer memberID);



    @Query("SELECT m.fileLink FROM MedicalRecord m WHERE m.member.memberID = :memberId")
    List<String> findFileLinksByMember_MemberID(@Param("memberId") Integer memberId);
    
    // Find top N records by doctor
    @Query("SELECT m FROM MedicalRecord m WHERE m.doctor = :doctor " +
           "ORDER BY m.uploadDate DESC LIMIT :limit")
    List<MedicalRecord> findTopNByDoctorOrderByUploadDateDesc(
        @Param("doctor") User doctor,
        @Param("limit") int limit
    );
    
    // Count methods for dashboard statistics
    @Query("SELECT COUNT(m) FROM MedicalRecord m WHERE m.doctor = :doctor " +
           "AND m.uploadDate >= :uploadDateAfter")
    int countByDoctorAndUploadDateAfter(
        @Param("doctor") User doctor,
        @Param("uploadDateAfter") LocalDateTime uploadDateAfter
    );
    
    @Query("SELECT COUNT(m) FROM MedicalRecord m WHERE m.doctor = :doctor " +
           "AND m.uploadDate >= :startDate " +
           "AND m.uploadDate <= :endDate")
    int countByDoctorAndDateRange(
        @Param("doctor") User doctor,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT m FROM MedicalRecord m WHERE m.doctor = :doctor " +
           "ORDER BY m.uploadDate DESC LIMIT 5")
    List<MedicalRecord> findTop5ByDoctorOrderByUploadDateDesc(@Param("doctor") User doctor);

}


