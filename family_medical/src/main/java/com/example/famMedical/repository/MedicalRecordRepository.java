package com.example.famMedical.repository;

import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    List<MedicalRecord> findByMember(Member member);
}
