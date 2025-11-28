package com.example.famMedical.resolver;

import com.example.famMedical.Entity.Appointment;
import com.example.famMedical.Entity.Appointment.AppointmentStatus;
import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.AppointmentFilter;
import com.example.famMedical.dto.CreateAppointmentInput;
import com.example.famMedical.dto.PatientAppointment;
import com.example.famMedical.dto.UpdateAppointmentInput;
import com.example.famMedical.service.AppointmentService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@AllArgsConstructor
@Slf4j
public class AppointmentResolver {
    
    private final AppointmentService appointmentService;
    
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public List<Appointment> appointments(
            @AuthenticationPrincipal User user,
            @Argument AppointmentFilter filter) {
        log.info("Getting appointments for doctor: {}, filter: {}", user.getUserID(), filter);
        return appointmentService.getAppointments(user.getUserID(), filter);
    }
    
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public Appointment appointmentDetail(
            @AuthenticationPrincipal User user,
            @Argument Integer appointmentID) {
        log.info("Getting appointment detail for doctor: {}, appointmentID: {}", user.getUserID(), appointmentID);
        return appointmentService.getAppointmentDetail(appointmentID, user.getUserID());
    }
    
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public List<Appointment> todayAppointments(@AuthenticationPrincipal User user) {
        log.info("Getting today's appointments for doctor: {}", user.getUserID());
        return appointmentService.getTodayAppointments(user.getUserID());
    }
    
    @QueryMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public List<Appointment> upcomingAppointments(@AuthenticationPrincipal User user) {
        log.info("Getting upcoming appointments for doctor: {}", user.getUserID());
        return appointmentService.getUpcomingAppointments(user.getUserID());
    }
    
    @QueryMapping
    @PreAuthorize("hasRole('ChuHo')")
    public List<PatientAppointment> familyAppointments(
            @AuthenticationPrincipal User user) {
        // log.info("Getting family appointments for user: {}", user.getUserID());
        return appointmentService.getFamilyAppointments(user.getUserID());
    }
    
    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public Appointment createAppointment(
            @AuthenticationPrincipal User user,
            @Argument CreateAppointmentInput input) {
        log.info("Creating appointment for doctor: {}, input: {}", user.getUserID(), input);
        return appointmentService.createAppointment(input, user.getUserID());
    }
    
    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public Appointment updateAppointment(
            @AuthenticationPrincipal User user,
            @Argument UpdateAppointmentInput input) {
        log.info("Updating appointment for doctor: {}, input: {}", user.getUserID(), input);
        return appointmentService.updateAppointment(input, user.getUserID());
    }
    
    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public Appointment updateAppointmentStatus(
            @AuthenticationPrincipal User user,
            @Argument Integer appointmentID,
            @Argument AppointmentStatus status) {
        log.info("Updating appointment status for doctor: {}, appointmentID: {}, status: {}", 
                user.getUserID(), appointmentID, status);
        return appointmentService.updateAppointmentStatus(appointmentID, status, user.getUserID());
    }
    
    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public Appointment cancelAppointment(
            @AuthenticationPrincipal User user,
            @Argument Integer appointmentID,
            @Argument String reason) {
        log.info("Cancelling appointment for doctor: {}, appointmentID: {}, reason: {}", 
                user.getUserID(), appointmentID, reason);
        return appointmentService.cancelAppointment(appointmentID, reason, user.getUserID());
    }
    
    // Field-level security for doctorNotes
    @org.springframework.graphql.data.method.annotation.SchemaMapping(typeName = "Appointment", field = "doctorNotes")
    public String doctorNotes(
            Appointment appointment,
            @AuthenticationPrincipal User user) {
        // Only return doctorNotes if user is a doctor
        if (user != null && "BacSi".equals(user.getRole().name())) {
            return appointment.getDoctorNotes();
        }
        return null; // Hide from patients
    }

    @QueryMapping
    @PreAuthorize("hasRole('ChuHo')")
    public List<Appointment> getAllAppointmentByChuHo(
            @AuthenticationPrincipal User user) {
        // In ra các quyền mà Spring Security đang thấy
        System.out.println("CHECKING AUTHORITIES IN RESOLVER: " + org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        
        log.info("Getting all appointments for user: {}", user.getUserID());
        return appointmentService.getAllAppointmentByChuHo(user.getUserID());
    }
}
