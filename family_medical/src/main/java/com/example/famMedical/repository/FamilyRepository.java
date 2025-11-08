package com.example.famMedical.repository;

import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyRepository extends JpaRepository<Family, Integer> {
    
    @Query("SELECT DISTINCT f FROM Family f " +
           "JOIN DoctorRequest dr ON f = dr.family " +
           "WHERE dr.doctor = :doctor AND dr.status = 'ACCEPTED'")
    List<Family> findFamiliesAssignedToDoctor(@Param("doctor") User doctor);
}