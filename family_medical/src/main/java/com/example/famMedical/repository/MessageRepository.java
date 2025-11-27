package com.example.famMedical.repository;

import com.example.famMedical.Entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    @Query("SELECT m FROM Message m WHERE m.conversation.conversationID = :conversationId ORDER BY m.createdAt DESC")
    Page<Message> findByConversationID(@Param("conversationId") Integer conversationId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.conversationID = :conversationId AND m.isRead = false AND m.sender.userID != :userId")
    int countUnreadByConversationAndUser(@Param("conversationId") Integer conversationId, @Param("userId") Integer userId);

    @Query("SELECT COUNT(m) FROM Message m JOIN m.conversation c WHERE (c.doctor.userID = :userId OR c.family.headOfFamily.userID = :userId) AND m.isRead = false AND m.sender.userID != :userId")
    int countUnreadByUser(@Param("userId") Integer userId);

    @Query("SELECT m FROM Message m JOIN FETCH m.sender WHERE m.conversation.conversationID = :conversationId ORDER BY m.createdAt DESC")
    Page<Message> findLastMessageByConversationIDWithSender(@Param("conversationId") Integer conversationId, Pageable pageable);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.readAt = :readAt WHERE m.conversation.conversationID = :conversationId AND m.sender.userID != :userId AND m.isRead = false")
    int markConversationAsRead(@Param("conversationId") Integer conversationId, @Param("userId") Integer userId, @Param("readAt") LocalDateTime readAt);

    /**
     * Search messages using MySQL full-text search with multiple filters
     * 11.1, 11.2, 11.3, 11.4, 11.5
     * 
     * Uses MATCH...AGAINST for efficient full-text search when keyword is provided.
     * Falls back to returning all messages when keyword is null.
     * Supports filtering by conversation, date range, and pagination.
     * 
     * Note: The FULLTEXT index on content column must be created via migration:
     * ALTER TABLE messages ADD FULLTEXT INDEX idx_content_fulltext (content);
     */
    @Query(value = """
       SELECT m.* FROM messages m 
       WHERE (:keyword IS NULL OR :keyword = '' OR MATCH(m.content) AGAINST (:keyword IN NATURAL LANGUAGE MODE))
       AND (:conversationId IS NULL OR m.conversation_id = :conversationId)
       AND (:startDate IS NULL OR m.created_at >= :startDate)
       AND (:endDate IS NULL OR m.created_at <= :endDate)
       ORDER BY m.created_at DESC
       """,
       countQuery = """
       SELECT COUNT(*) FROM messages m 
       WHERE (:keyword IS NULL OR :keyword = '' OR MATCH(m.content) AGAINST (:keyword IN NATURAL LANGUAGE MODE))
       AND (:conversationId IS NULL OR m.conversation_id = :conversationId)
       AND (:startDate IS NULL OR m.created_at >= :startDate)
       AND (:endDate IS NULL OR m.created_at <= :endDate)
       """,
       nativeQuery = true)
    Page<Message> searchMessages(@Param("keyword") String keyword,
                             @Param("conversationId") Integer conversationId,
                             @Param("startDate") LocalDateTime startDate,
                             @Param("endDate") LocalDateTime endDate,
                             Pageable pageable);
}
