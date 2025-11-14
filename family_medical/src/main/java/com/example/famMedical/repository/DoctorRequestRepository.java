package com.example.famMedical.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.famMedical.Entity.DoctorRequest;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRequestRepository extends JpaRepository<DoctorRequest, Integer> {
    
    @Query("SELECT DISTINCT dr FROM DoctorRequest dr LEFT JOIN FETCH dr.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH dr.doctor")
    List<DoctorRequest> findAllWithRelations();
    
    @Query("SELECT DISTINCT dr FROM DoctorRequest dr LEFT JOIN FETCH dr.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH dr.doctor WHERE dr.status = :status")
    List<DoctorRequest> findByStatus(@Param("status") DoctorRequest.RequestStatus status);
    
    @Query("SELECT DISTINCT dr FROM DoctorRequest dr LEFT JOIN FETCH dr.family f LEFT JOIN FETCH f.headOfFamily LEFT JOIN FETCH dr.doctor WHERE dr.requestID = :id")
    Optional<DoctorRequest> findByIdWithRelations(@Param("id") Integer id);
    
    List<DoctorRequest> findByDoctor_UserID(Integer doctorID);
}
