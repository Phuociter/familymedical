package com.example.famMedical.repository;

import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    
    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.family")
    List<Member> findAllWithFamily();
    
    List<Member> findByFamily_FamilyID(Integer familyID);
    
    // Count methods for dashboard statistics
    @Query("SELECT COUNT(DISTINCT m) FROM Member m " +
           "JOIN m.family f " +
           "JOIN DoctorAssignment da ON da.family = f " +
           "WHERE da.doctor = :doctor AND da.status = 'ACTIVE'")
    int countByDoctorAssignments(@Param("doctor") User doctor);
}