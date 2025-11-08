package com.example.famMedical.repository;

import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRequestRepository extends JpaRepository<DoctorRequest, Integer> {
    
    @Query("SELECT dr FROM DoctorRequest dr WHERE dr.doctor = :doctor")
    List<DoctorRequest> findByDoctor(@Param("doctor") User doctor);
    
    @Query("SELECT dr FROM DoctorRequest dr WHERE dr.doctor = :doctor AND dr.status = 'PENDING'")
    List<DoctorRequest> findPendingRequestsByDoctor(@Param("doctor") User doctor);
    
    @Query("SELECT dr FROM DoctorRequest dr WHERE dr.doctor = :doctor AND dr.status = 'ACCEPTED'")
    List<DoctorRequest> findAcceptedRequestsByDoctor(@Param("doctor") User doctor);
}