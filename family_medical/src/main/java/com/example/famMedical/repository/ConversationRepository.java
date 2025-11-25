package com.example.famMedical.repository;

import com.example.famMedical.Entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.doctor.userID = :doctorId AND c.family.familyID = :familyId")
    Optional<Conversation> findByDoctorAndFamily(@Param("doctorId") Integer doctorId, @Param("familyId") Integer familyId);

    @Query("SELECT c FROM Conversation c WHERE c.doctor.userID = :userId OR c.family.headOfFamily.userID = :userId ORDER BY c.lastMessageAt DESC")
    Page<Conversation> findByUserID(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.doctor.userID = :userId OR c.family.headOfFamily.userID = :userId")
    long countByUserID(@Param("userId") Integer userId);
}
