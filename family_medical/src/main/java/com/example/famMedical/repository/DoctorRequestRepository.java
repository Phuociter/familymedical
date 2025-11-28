package com.example.famMedical.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.famMedical.Entity.DoctorAssignment;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.User;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

import javax.print.Doc;

@Repository
public interface DoctorRequestRepository extends JpaRepository<DoctorRequest, Integer> {
    
    @Query("SELECT DISTINCT dr FROM DoctorRequest dr LEFT JOIN FETCH dr.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH dr.doctor")
    List<DoctorRequest> findAllWithRelations();
    
    @Query("SELECT DISTINCT dr FROM DoctorRequest dr LEFT JOIN FETCH dr.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH dr.doctor WHERE dr.status = :status")
    List<DoctorRequest> findByStatus(@Param("status") DoctorRequest.RequestStatus status);
    
    @Query("SELECT DISTINCT dr FROM DoctorRequest dr LEFT JOIN FETCH dr.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH dr.doctor WHERE dr.requestID = :id")
    Optional<DoctorRequest> findByIdWithRelations(@Param("id") Integer id);
    
    List<DoctorRequest> findByDoctor_UserID(Integer doctorID);

    DoctorRequest findTopByFamily_FamilyIDOrderByRequestDateDesc(Integer familyID);

    // New methods for GraphQL API
    @Query("SELECT DISTINCT dr FROM DoctorRequest dr LEFT JOIN FETCH dr.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH dr.doctor WHERE dr.doctor = :doctor")
    List<DoctorRequest> findByDoctor(@Param("doctor") User doctor);
    
    @Query("SELECT DISTINCT dr FROM DoctorRequest dr LEFT JOIN FETCH dr.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH dr.doctor WHERE dr.doctor = :doctor AND dr.status = :status")
    List<DoctorRequest> findByDoctorAndStatus(@Param("doctor") User doctor, @Param("status") DoctorRequest.RequestStatus status);
    
    Optional<DoctorRequest> findByRequestID(Integer requestID);
    
    // Count methods for dashboard statistics
    int countByDoctorAndStatus(User doctor, DoctorRequest.RequestStatus status);

    @Query("SELECT dr FROM DoctorRequest dr JOIN FETCH dr.doctor WHERE dr.requestID = :id")
    Optional<DoctorRequest> findByIdWithDoctor(@Param("id") Integer id);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT dr FROM DoctorRequest dr JOIN FETCH dr.doctor JOIN FETCH dr.family WHERE dr.requestID = :id")
    Optional<DoctorRequest> findByIdWithLock(@Param("id") Integer id);

}
