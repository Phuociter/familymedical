package com.example.famMedical.repository;

import com.example.famMedical.Entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.user.userID = :userId ORDER BY n.createdAt DESC")
    Page<Notification> findByUserID(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.userID = :userId AND n.isRead = false")
    int countUnreadByUser(@Param("userId") Integer userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.userID = :userId AND n.isRead = false")
    int markAllAsReadByUser(@Param("userId") Integer userId, @Param("readAt") LocalDateTime readAt);
}
