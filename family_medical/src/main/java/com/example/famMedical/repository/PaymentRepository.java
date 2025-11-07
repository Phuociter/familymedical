package com.example.famMedical.repository;

import com.example.famMedical.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByPaymentStatus(String paymentStatus);
    List<Payment> findByFamily_FamilyID(Integer familyID);
    List<Payment> findByDoctor_UserID(Integer doctorID);
    
    // Query với join fetch để load đầy đủ relationships
    @Query("SELECT DISTINCT p FROM Payment p LEFT JOIN FETCH p.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH p.doctor")
    List<Payment> findAllWithRelations();
    
    @Query("SELECT DISTINCT p FROM Payment p LEFT JOIN FETCH p.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH p.doctor WHERE p.paymentStatus = :paymentStatus")
    List<Payment> findByStatusWithRelations(String paymentStatus);
}

