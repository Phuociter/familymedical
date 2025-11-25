package com.example.famMedical.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.famMedical.Entity.DoctorAssignment;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.Entity.User;

@Repository
public interface DoctorAssignmentRepository extends JpaRepository<DoctorAssignment, Integer> {

    boolean existsByDoctorUserIDAndFamilyFamilyIDAndStatus(int doctorId, int familyId, AssignmentStatus status);

    // Count methods for dashboard statistics
    @Query("SELECT COUNT(da) FROM DoctorAssignment da WHERE da.doctor = :doctor AND da.status = 'ACTIVE'")
    int countByDoctor(@Param("doctor") User doctor);
}
