package com.example.famMedical.service;

import com.example.famMedical.Entity.Appointment;
import com.example.famMedical.Entity.Appointment.AppointmentStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.dto.AppointmentFilter;
import com.example.famMedical.dto.CreateAppointmentInput;
import com.example.famMedical.dto.PatientAppointment;
import com.example.famMedical.dto.UpdateAppointmentInput;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.exception.ValidationException;
import com.example.famMedical.repository.AppointmentRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.UserRepository;
import lombok.AllArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final MemberRepository memberRepository;
    
    public List<Appointment> getAppointments(Integer doctorId, AppointmentFilter filter) {
        User doctor = validateDoctor(doctorId);
        
        if (filter == null) {
            return appointmentRepository.findByDoctorOrderByAppointmentDateTimeAsc(doctor);
        }
        
        return appointmentRepository.findByDoctorWithFilter(
            doctor,
            filter.getStatus(),
            filter.getStartDate(),
            filter.getEndDate()
        );
    }
    
    public Appointment getAppointmentDetail(Integer appointmentId, Integer doctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new NotFoundException("Appointment not found"));
            
        validateDoctorAccess(appointment, doctorId);
        return appointment;
    }
    
    public List<Appointment> getTodayAppointments(Integer doctorId) {
        User doctor = validateDoctor(doctorId);
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        return appointmentRepository.findByDoctorAndAppointmentDateTimeBetween(
            doctor, startOfDay, endOfDay
        );
    }
    
    public List<Appointment> getUpcomingAppointments(Integer doctorId) {
        User doctor = validateDoctor(doctorId);
        LocalDateTime now = LocalDateTime.now();
        
        return appointmentRepository.findByDoctorAndAppointmentDateTimeAfter(doctor, now);
    }
    
    public Appointment createAppointment(CreateAppointmentInput input, Integer doctorId) {
        User doctor = validateDoctor(doctorId);
        Family family = familyRepository.findById(input.getFamilyID())
            .orElseThrow(() -> new NotFoundException("Family not found"));
        Member member = memberRepository.findById(input.getMemberID())
            .orElseThrow(() -> new NotFoundException("Member not found"));
        
        LocalDateTime appointmenLocalDateTime = input.getAppointmentDateTime().atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();

        // Validate appointment datetime is not in the past
        if (appointmenLocalDateTime.isBefore(LocalDateTime.now())) {
            throw new ValidationException("Appointment datetime cannot be in the past");
        }
        
        // Validate duration
        if (input.getDuration() == null || input.getDuration() <= 0 || input.getDuration() > 480) {
            throw new ValidationException("Duration must be between 1 and 480 minutes");
        }
        
        // Check for overlapping appointments
        checkOverlappingAppointments(doctor, input.getAppointmentDateTime().toLocalDateTime(), input.getDuration(), null);
        
        Appointment appointment = Appointment.builder()
            .family(family)
            .member(member)
            .doctor(doctor)
            .title(input.getTitle())
            .type(input.getType())
            .appointmentDateTime(appointmenLocalDateTime)
            .duration(input.getDuration())
            .location(input.getLocation())
            .notes(input.getNotes())
            .doctorNotes(input.getDoctorNotes())
            .status(AppointmentStatus.SCHEDULED)
            .createdAt(LocalDateTime.now())
            .build();
        return appointmentRepository.save(appointment);
    }
    
    public Appointment updateAppointment(UpdateAppointmentInput input, Integer doctorId) {
        Appointment appointment = getAppointmentDetail(input.getAppointmentID(), doctorId);
        
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new ValidationException("Cannot update completed appointment");
        }
        
        if (input.getTitle() != null) appointment.setTitle(input.getTitle());
        if (input.getType() != null) appointment.setType(input.getType());
        if (input.getAppointmentDateTime() != null) {
            if (input.getAppointmentDateTime().isBefore(LocalDateTime.now())) {
                throw new ValidationException("Appointment datetime cannot be in the past");
            }
            appointment.setAppointmentDateTime(input.getAppointmentDateTime());
        }
        if (input.getDuration() != null) {
            if (input.getDuration() <= 0 || input.getDuration() > 480) {
                throw new ValidationException("Duration must be between 1 and 480 minutes");
            }
            appointment.setDuration(input.getDuration());
        }
        if (input.getLocation() != null) appointment.setLocation(input.getLocation());
        if (input.getNotes() != null) appointment.setNotes(input.getNotes());
        if (input.getDoctorNotes() != null) appointment.setDoctorNotes(input.getDoctorNotes());
        
        return appointmentRepository.save(appointment);
    }
    
    public Appointment updateAppointmentStatus(Integer appointmentId, AppointmentStatus status, Integer doctorId) {
        Appointment appointment = getAppointmentDetail(appointmentId, doctorId);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
    
    public Appointment cancelAppointment(Integer appointmentId, String reason, Integer doctorId) {
        Appointment appointment = getAppointmentDetail(appointmentId, doctorId);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        
        if (reason != null && !reason.isEmpty()) {
            String cancelNote = "Cancelled: " + reason;
            appointment.setDoctorNotes(
                appointment.getDoctorNotes() != null 
                    ? appointment.getDoctorNotes() + "\n" + cancelNote 
                    : cancelNote
            );
        }
        
        return appointmentRepository.save(appointment);
    }
    
    public List<PatientAppointment> getFamilyAppointments(Integer userId) {
        // Find family by head of family user ID
        Family family = familyRepository.findByHeadOfFamily_UserID(userId);
        if (family == null) {
            throw new NotFoundException("Family not found for user");
        }
        
        List<Appointment> appointments = appointmentRepository.findByFamilyOrderByAppointmentDateTimeDesc(family);
        
        // Convert to PatientAppointment (without doctorNotes)
        return appointments.stream()
            .map(this::toPatientAppointment)
            .collect(Collectors.toList());
    }
    
    private void checkOverlappingAppointments(User doctor, LocalDateTime dateTime, Integer duration, Integer excludeAppointmentId) {
        LocalDateTime newAppointmentEnd = dateTime.plusMinutes(duration);
        
        // Get all potentially overlapping appointments (those that start before our appointment ends)
        List<Appointment> potentialOverlaps = appointmentRepository.findPotentiallyOverlappingAppointments(
            doctor, newAppointmentEnd, AppointmentStatus.SCHEDULED
        );
        
        // Check for actual overlaps in Java
        List<Appointment> overlapping = potentialOverlaps.stream()
            .filter(a -> {
                // Skip the current appointment if updating
                if (excludeAppointmentId != null && a.getAppointmentID().equals(excludeAppointmentId)) {
                    return false;
                }
                
                // Check if appointments overlap
                // Overlap occurs if: existingEnd > newStart AND existingStart < newEnd
                LocalDateTime existingEnd = a.getEndTime();
                return existingEnd.isAfter(dateTime) && a.getAppointmentDateTime().isBefore(newAppointmentEnd);
            })
            .collect(Collectors.toList());
        
        if (!overlapping.isEmpty()) {
            throw new ValidationException("Doctor has overlapping appointment at this time");
        }
    }
    
    private PatientAppointment toPatientAppointment(Appointment appointment) {
        return PatientAppointment.builder()
            .appointmentID(appointment.getAppointmentID())
            .title(appointment.getTitle())
            .type(appointment.getType())
            .appointmentDateTime(appointment.getAppointmentDateTime())
            .duration(appointment.getDuration())
            .status(appointment.getStatus())
            .location(appointment.getLocation())
            .notes(appointment.getNotes())
            .doctor(appointment.getDoctor())
            .member(appointment.getMember())
            .createdAt(appointment.getCreatedAt())
            .build();
    }
    
    private void validateDoctorAccess(Appointment appointment, Integer doctorId) {
        if (!appointment.getDoctor().getUserID().equals(doctorId)) {
            throw new AuthException("Not authorized to access this appointment");
        }
    }
    
    private User validateDoctor(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
            .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        if (doctor.getRole() != UserRole.BacSi) {
            throw new AuthException("User is not a doctor");
        }
        
        return doctor;
    }
}
