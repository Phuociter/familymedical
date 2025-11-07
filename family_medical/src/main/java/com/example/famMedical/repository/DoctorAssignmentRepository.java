package com.example.famMedical.repository;

import com.example.famMedical.Entity.DoctorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorAssignmentRepository extends JpaRepository<DoctorAssignment, Integer> {
    List<DoctorAssignment> findByDoctor_UserID(Integer doctorId);
}
