package com.example.famMedical.repository;

import com.example.famMedical.Entity.Member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
       List<Member> findByMemberID(Integer memberID);
       
       // Fetch members với Family để tránh lazy loading issues
       // Sử dụng DISTINCT để tránh duplicate khi có multiple joins
       @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.family")
       List<Member> findAllWithFamily();

}