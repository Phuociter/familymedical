package com.example.famMedical.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.famMedical.Entity.DoctorAssignment;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;

@Repository
public interface DoctorAssignmentRepository extends JpaRepository<DoctorAssignment, Integer> {

    boolean existsByDoctorUserIDAndFamilyFamilyIDAndStatus(int doctorId, int familyId, AssignmentStatus status);

}
