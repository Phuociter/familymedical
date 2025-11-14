package com.example.famMedical.repository;

import com.example.famMedical.Entity.Member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    
    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.family")
    List<Member> findAllWithFamily();
    
    List<Member> findByFamily_FamilyID(Integer familyID);
}