
package com.example.famMedical.repository;

import com.example.famMedical.Entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    
    List<MedicalRecord> findByMemberID_MemberID(Integer memberID);

    @Query("SELECT m.fileLink FROM MedicalRecord m WHERE m.member.memberID = :memberId")
    List<String> findFileLinksByMemberId(@Param("memberId") Integer memberId);
}


