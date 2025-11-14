package com.example.famMedical.repository;

import com.example.famMedical.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByUser_UserID(int userId);
    
    @Query("SELECT DISTINCT p FROM Payment p LEFT JOIN FETCH p.user WHERE p.paymentStatus = :status")
    List<Payment> findByPaymentStatus(@Param("status") Payment.PaymentStatus paymentStatus);
    
    Optional<Payment> findByTransactionCode(String transactionCode);
    
    // Lấy các payment của 1 user có ngày hết hạn lớn hơn ngày hiện tại
    @Query("SELECT p FROM Payment p WHERE p.user.userID = :userId AND p.expiryDate > CURRENT_DATE")
    List<Payment> findByUser_UserId(@Param("userId") Integer userId);
    
    // Query tất cả payments với user được load
    @Query("SELECT DISTINCT p FROM Payment p LEFT JOIN FETCH p.user")
    List<Payment> findAllWithUser();
}

