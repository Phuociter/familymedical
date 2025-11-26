package com.example.famMedical.repository;

import com.example.famMedical.Entity.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Integer> {

    @Query("SELECT ma FROM MessageAttachment ma WHERE ma.message.messageID = :messageId")
    List<MessageAttachment> findByMessageID(@Param("messageId") Integer messageId);
}
