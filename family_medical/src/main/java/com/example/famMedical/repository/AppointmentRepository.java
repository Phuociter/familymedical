package com.example.famMedical.repository;

import com.example.famMedical.Entity.Appointment;
import com.example.famMedical.Entity.Appointment.AppointmentStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    
    List<Appointment> findByDoctorAndStatus(User doctor, AppointmentStatus status);
    
    List<Appointment> findByDoctorAndAppointmentDateTimeBetween(
        User doctor, LocalDateTime start, LocalDateTime end
    );
    
    List<Appointment> findByDoctorAndAppointmentDateTimeAfter(User doctor, LocalDateTime dateTime);
    
    List<Appointment> findByDoctorOrderByAppointmentDateTimeAsc(User doctor);
    
    List<Appointment> findByFamilyOrderByAppointmentDateTimeDesc(Family family);
    
    List<Appointment> findByMemberOrderByAppointmentDateTimeDesc(Member member);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:startDate IS NULL OR a.appointmentDateTime >= :startDate) " +
           "AND (:endDate IS NULL OR a.appointmentDateTime <= :endDate) " +
           "ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findByDoctorWithFilter(
        @Param("doctor") User doctor,
        @Param("status") AppointmentStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor " +
           "AND a.status = :status " +
           "AND a.appointmentDateTime < :endTime " +
           "AND FUNCTION('DATE_ADD', a.appointmentDateTime, a.duration, 'MINUTE') > :startTime")
    List<Appointment> findOverlappingAppointments(
        @Param("doctor") User doctor,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("status") AppointmentStatus status
    );
    
    // Count methods for dashboard statistics
    int countByDoctorAndAppointmentDateTimeBetween(
        User doctor, LocalDateTime start, LocalDateTime end
    );
    
    int countByDoctorAndStatus(User doctor, AppointmentStatus status);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor " +
           "AND a.appointmentDateTime >= :startDate " +
           "AND a.appointmentDateTime <= :endDate")
    int countByDoctorAndDateRange(
        @Param("doctor") User doctor,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor " +
           "ORDER BY a.createdAt DESC LIMIT 5")
    List<Appointment> findTop5ByDoctorOrderByCreatedAtDesc(@Param("doctor") User doctor);
}
