package com.example.famMedical.repository;

import com.example.famMedical.Entity.Family;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional; 
@Repository
public interface FamilyRepository extends JpaRepository<Family, Integer> {

    @Query("SELECT DISTINCT f FROM Family f LEFT JOIN FETCH f.headOfFamily")
    List<Family> findAllWithHeadOfFamily();

    @Query("SELECT DISTINCT f FROM Family f " +
        "JOIN f.doctorAssignments da " +
        "WHERE da.doctor.userID = :doctorId " +
        "AND da.status = 'ACTIVE' " +
        "ORDER BY f.familyName")
    List<Family> findAssignedFamiliesByDoctorId(@Param("doctorId") int doctorId);


    @Query("SELECT DISTINCT f FROM Family f " +
           "JOIN f.doctorAssignments da " +
           "WHERE da.doctor.userID = :doctorId " +
           "AND da.status = 'ACTIVE' " +
           "AND LOWER(f.familyName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Family> searchAssignedFamiliesByDoctorId(
        @Param("doctorId") int doctorId,
        @Param("search") String search
    );

    Optional<Family> findByHeadOfFamily_UserID(Integer userID);
}