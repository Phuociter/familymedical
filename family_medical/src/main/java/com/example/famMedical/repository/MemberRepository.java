package com.example.famMedical.repository;

import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    
    List<Member> findByFamily(Family family);
    
    @Query("SELECT m FROM Member m " +
           "JOIN m.family f " +
           "JOIN DoctorRequest dr ON f = dr.family " +
           "WHERE dr.doctor.userID = :doctorId AND dr.status = 'ACCEPTED'")
    List<Member> findMembersAccessibleByDoctor(@Param("doctorId") Integer doctorId);
}