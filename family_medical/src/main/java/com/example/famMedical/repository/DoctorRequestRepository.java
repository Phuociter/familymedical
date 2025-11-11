package com.example.famMedical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.famMedical.Entity.DoctorRequest;

@Repository
public interface DoctorRequestRepository extends JpaRepository<DoctorRequest, Integer> {
    
}
