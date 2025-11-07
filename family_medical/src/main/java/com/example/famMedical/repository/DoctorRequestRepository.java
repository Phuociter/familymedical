package com.example.famMedical.repository;

import com.example.famMedical.Entity.DoctorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRequestRepository extends JpaRepository<DoctorRequest, Integer> {
    List<DoctorRequest> findByStatus(DoctorRequest.RequestStatus status);
}
