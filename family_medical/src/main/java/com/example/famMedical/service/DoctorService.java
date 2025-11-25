package com.example.famMedical.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.famMedical.Entity.Appointment;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.dto.Doctor.Activity;
import com.example.famMedical.dto.Doctor.DoctorDashboard;
import com.example.famMedical.dto.Doctor.DoctorStats;
import com.example.famMedical.dto.Doctor.UpdateDoctorInput;
import com.example.famMedical.dto.Doctor.WeeklyStats;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.repository.AppointmentRepository;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.DoctorRequestRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MedicalRecordRepository;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.NonNull;

@Service
@AllArgsConstructor
public class DoctorService {
    private final FamilyRepository familyRepo;
    private final MemberRepository memberRepo;
    private final MedicalRecordRepository medicalRecordRepo; 
    private final UserRepository userRepo;
    private final DoctorAssignmentRepository assignmentRepo;
    private final DoctorRequestRepository doctorRequestRepo;
    private final AppointmentRepository appointmentRepo;

    public List<Family> getDoctorAssignedFamilies(int doctorId, String search) {
        validateDoctor(doctorId);
        
        if (search != null && !search.trim().isEmpty()) {
            return familyRepo.searchAssignedFamiliesByDoctorId(doctorId, search.trim());
        }
        return familyRepo.findAssignedFamiliesByDoctorId(doctorId);
    }
    
    public List<Member> getFamilyMembers(int doctorId, int familyId) {
        validateDoctor(doctorId);
        validateDoctorAccessToFamily(doctorId, familyId);
        
        return memberRepo.findByFamily_FamilyID(familyId);
    }
    
    public List<MedicalRecord> getMemberMedicalRecords(int doctorId, int memberId) {
        validateDoctor(doctorId);
        
        Member member = memberRepo.findById(memberId)
            .orElseThrow(() -> new NotFoundException("Member không tồn tại"));
        
        validateDoctorAccessToFamily(doctorId, member.getFamily().getFamilyID());
        
        return medicalRecordRepo.findByMember_MemberID(memberId);
    }

    // Doctor Request methods
    public List<DoctorRequest> getDoctorRequests(Integer doctorId, DoctorRequest.RequestStatus status) {
        User doctor = validateDoctor(doctorId);
        
        if (status != null) {
            return doctorRequestRepo.findByDoctorAndStatus(doctor, status);
        }
        return doctorRequestRepo.findByDoctor(doctor);
    }
    
    public DoctorRequest getDoctorRequestDetail(Integer requestId, Integer doctorId) {
        DoctorRequest request = doctorRequestRepo.findById(requestId)
            .orElseThrow(() -> new NotFoundException("Doctor request not found"));
        
        User requestDoctor = request.getDoctor();
        if (requestDoctor == null || !requestDoctor.getUserID().equals(doctorId)) {
            throw new AuthException("Not authorized to view this request");
        }
        
        return request;
    }
    
    public DoctorRequest respondToRequest(Integer requestId, DoctorRequest.RequestStatus status, 
                                         String message, Integer doctorId) {
        DoctorRequest request = getDoctorRequestDetail(requestId, doctorId);
        
        

        request.setStatus(status);
        request.setResponseMessage(message);
        request.setResponseDate(LocalDateTime.now());
        
        return doctorRequestRepo.save(request);
    }

    public User updateDoctorProfile(@NonNull Integer doctorId, UpdateDoctorInput input) {
        User doctor = userRepo.findById(doctorId)
        .orElseThrow(() -> new NotFoundException("Không tìm thấy bác sĩ"));
    
        updateFieldIfPresent(input.getFullName(), doctor::setFullName);
        updateFieldIfPresent(input.getPhoneNumber(), doctor::setPhoneNumber);
        updateFieldIfPresent(input.getAddress(), doctor::setAddress);
        updateFieldIfPresent(input.getCccd(), doctor::setCccd);
        updateFieldIfPresent(input.getAvatarUrl(), doctor::setAvatarUrl);
        updateFieldIfPresent(input.getDoctorCode(), doctor::setDoctorCode);
        updateFieldIfPresent(input.getHospitalName(), doctor::setHospitalName);
        updateFieldIfPresent(input.getYearsOfExperience(), doctor::setYearsOfExperience);
        
        return userRepo.save(doctor);
    }

    private void updateFieldIfPresent(String value, Consumer<String> setter) {
        if (value != null) {
            setter.accept(value.isEmpty() ? null : value.trim());
        }
    }

    // Dashboard methods
    public DoctorDashboard getDoctorDashboard(Integer doctorId) {
        User doctor = validateDoctor(doctorId);
        
        // Calculate statistics
        DoctorStats stats = calculateDoctorStats(doctor);
        List<WeeklyStats> weeklyStats = calculateWeeklyStats(doctor);
        List<Activity> recentActivities = getRecentActivities(doctor);
        
        // Get today's appointments
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<Appointment> todayAppointments = appointmentRepo.findByDoctorAndAppointmentDateTimeBetween(
            doctor, startOfDay, endOfDay
        );
        
        // Get pending requests
        List<DoctorRequest> pendingRequests = doctorRequestRepo
            .findByDoctorAndStatus(doctor, DoctorRequest.RequestStatus.PENDING);
        
        return DoctorDashboard.builder()
            .stats(stats)
            .weeklyStats(weeklyStats)
            .recentActivities(recentActivities)
            .todayAppointments(todayAppointments)
            .pendingRequests(pendingRequests)
            .build();
    }
    
    private DoctorStats calculateDoctorStats(User doctor) {
        // Total families assigned to doctor
        int totalFamilies = assignmentRepo.countByDoctor(doctor);
        
        // Total patients (members) across all families
        int totalPatients = memberRepo.countByDoctorAssignments(doctor);
        
        // New records this month
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        int newRecordsThisMonth = medicalRecordRepo
            .countByDoctorAndUploadDateAfter(doctor, startOfMonth);
        
        // Today's appointments
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        int todayAppointments = appointmentRepo
            .countByDoctorAndAppointmentDateTimeBetween(doctor, startOfDay, endOfDay);
        
        // Pending requests
        int pendingRequests = doctorRequestRepo
            .countByDoctorAndStatus(doctor, DoctorRequest.RequestStatus.PENDING);
        
        return DoctorStats.builder()
            .totalFamilies(totalFamilies)
            .totalPatients(totalPatients)
            .newRecordsThisMonth(newRecordsThisMonth)
            .todayAppointments(todayAppointments)
            .pendingRequests(pendingRequests)
            .build();
    }
    
    private List<WeeklyStats> calculateWeeklyStats(User doctor) {
        List<WeeklyStats> weeklyStats = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        for (int i = 0; i < 4; i++) {
            LocalDate weekStart = today.minusWeeks(i).with(DayOfWeek.MONDAY);
            LocalDate weekEnd = weekStart.plusDays(6);
            
            int appointments = appointmentRepo.countByDoctorAndDateRange(
                doctor, weekStart.atStartOfDay(), weekEnd.atTime(23, 59, 59)
            );
            
            int newRecords = medicalRecordRepo.countByDoctorAndDateRange(
                doctor, weekStart.atStartOfDay(), weekEnd.atTime(23, 59, 59)
            );
            
            weeklyStats.add(WeeklyStats.builder()
                .week(weekStart.toString())
                .appointments(appointments)
                .newRecords(newRecords)
                .build());
        }
        
        return weeklyStats;
    }
    
    private List<Activity> getRecentActivities(User doctor) {
        List<Activity> activities = new ArrayList<>();
        
        // Recent appointments
        List<Appointment> recentAppointments = appointmentRepo
            .findTop5ByDoctorOrderByCreatedAtDesc(doctor);
        recentAppointments.forEach(apt -> activities.add(Activity.builder()
            .activityID(String.valueOf(apt.getAppointmentID()))
            .type("APPOINTMENT_CREATED")
            .description("Created appointment: " + apt.getTitle())
            .timestamp(apt.getCreatedAt())
            .relatedEntity("Appointment")
            .relatedEntityID(apt.getAppointmentID())
            .build()));
        
        // Recent medical records
        List<MedicalRecord> recentRecords = medicalRecordRepo
            .findTop5ByDoctorOrderByUploadDateDesc(doctor);
        recentRecords.forEach(record -> activities.add(Activity.builder()
            .activityID(String.valueOf(record.getRecordID()))
            .type("MEDICAL_RECORD_CREATED")
            .description("Uploaded medical record for " + record.getMember().getFullName())
            .timestamp(record.getRecordDate().atTime(0, 0, 0))
            .relatedEntity("MedicalRecord")
            .relatedEntityID(record.getRecordID())
            .build()));
        
        // Sort by timestamp descending and limit to 10
        return activities.stream()
            .sorted(Comparator.comparing(Activity::getTimestamp).reversed())
            .limit(10)
            .collect(Collectors.toList());
    }
    
    private User validateDoctor(int doctorId) {
        User doctor = userRepo.findById(doctorId)
            .orElseThrow(() -> new NotFoundException("Doctor không tồn tại"));
        
        if (doctor.getRole() != UserRole.BacSi) {
            throw new AuthException("User không phải là doctor");
        }
        
        return doctor;
    }
    
    private void validateDoctorAccessToFamily(int doctorId, int familyId) {
        Boolean hasAccess = assignmentRepo
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctorId, familyId, AssignmentStatus.ACTIVE);
            
        if (!hasAccess) {
            throw new AuthException("Bạn không có quyền truy cập gia đình này");
        }
    }
}
