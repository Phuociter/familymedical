package com.example.famMedical.service;

import com.example.famMedical.Entity.*;
import com.example.famMedical.Entity.Appointment.AppointmentStatus;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentService Tests")
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    private User doctor;
    private User nonDoctor;
    private Family family;
    private Member member;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        // Setup doctor
        doctor = new User();
        doctor.setUserID(1);
        doctor.setFullName("Dr. John Doe");
        doctor.setEmail("doctor@test.com");
        doctor.setRole(UserRole.BacSi);

        // Setup non-doctor user
        nonDoctor = new User();
        nonDoctor.setUserID(2);
        nonDoctor.setEmail("user@test.com");
        nonDoctor.setRole(UserRole.ChuHo);

        // Setup family
        family = new Family();
        family.setFamilyID(1);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(nonDoctor);

        // Setup member
        member = new Member();
        member.setMemberID(1);
        member.setFamily(family);
        member.setFullName("John Member");
        member.setDateOfBirth(LocalDate.of(1990, 1, 1));

        // Setup appointment
        appointment = Appointment.builder()
            .appointmentID(1)
            .doctor(doctor)
            .family(family)
            .member(member)
            .title("General Checkup")
            .type(AppointmentType.GENERAL_CHECKUP)
            .appointmentDateTime(LocalDateTime.now().plusDays(1))
            .duration(30)
            .status(AppointmentStatus.SCHEDULED)
            .location("Test Clinic")
            .notes("Test notes")
            .doctorNotes("Test doctor notes")
            .createdAt(LocalDateTime.now())
            .build();
    }

    @Test
    @DisplayName("Should get appointments without filter")
    void testGetAppointmentsWithoutFilter() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findByDoctorOrderByAppointmentDateTimeAsc(doctor))
            .thenReturn(Arrays.asList(appointment));

        // When
        List<Appointment> result = appointmentService.getAppointments(1, null);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("General Checkup");
        verify(appointmentRepository).findByDoctorOrderByAppointmentDateTimeAsc(doctor);
    }

    @Test
    @DisplayName("Should get appointments with filter")
    void testGetAppointmentsWithFilter() {
        // Given
        AppointmentFilter filter = new AppointmentFilter();
        filter.setStatus(AppointmentStatus.SCHEDULED);
        
        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findByDoctorWithFilter(eq(doctor), any(), any(), any()))
            .thenReturn(Arrays.asList(appointment));

        // When
        List<Appointment> result = appointmentService.getAppointments(1, filter);

        // Then
        assertThat(result).hasSize(1);
        verify(appointmentRepository).findByDoctorWithFilter(eq(doctor), any(), any(), any());
    }

    @Test
    @DisplayName("Should throw exception when getting appointments for non-doctor")
    void testGetAppointmentsForNonDoctor() {
        // Given
        when(userRepository.findById(2)).thenReturn(Optional.of(nonDoctor));

        // When & Then
        assertThatThrownBy(() -> appointmentService.getAppointments(2, null))
            .isInstanceOf(AuthException.class)
            .hasMessageContaining("User is not a doctor");
    }

    @Test
    @DisplayName("Should get appointment detail")
    void testGetAppointmentDetail() {
        // Given
        when(appointmentRepository.findById(1)).thenReturn(Optional.of(appointment));

        // When
        Appointment result = appointmentService.getAppointmentDetail(1, 1);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAppointmentID()).isEqualTo(1);
        assertThat(result.getTitle()).isEqualTo("General Checkup");
    }

    @Test
    @DisplayName("Should throw exception when appointment not found")
    void testGetAppointmentDetailNotFound() {
        // Given
        when(appointmentRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> appointmentService.getAppointmentDetail(999, 1))
            .isInstanceOf(NotFoundException.class)
            .hasMessageContaining("Appointment not found");
    }

    @Test
    @DisplayName("Should throw exception when doctor tries to access another doctor's appointment")
    void testGetAppointmentDetailUnauthorized() {
        // Given
        User anotherDoctor = new User();
        anotherDoctor.setUserID(3);
        anotherDoctor.setRole(UserRole.BacSi);
        
        appointment.setDoctor(anotherDoctor);
        when(appointmentRepository.findById(1)).thenReturn(Optional.of(appointment));

        // When & Then
        assertThatThrownBy(() -> appointmentService.getAppointmentDetail(1, 1))
            .isInstanceOf(AuthException.class)
            .hasMessageContaining("Not authorized to access this appointment");
    }

    @Test
    @DisplayName("Should get today's appointments")
    void testGetTodayAppointments() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findByDoctorAndAppointmentDateTimeBetween(
            eq(doctor), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Arrays.asList(appointment));

        // When
        List<Appointment> result = appointmentService.getTodayAppointments(1);

        // Then
        assertThat(result).hasSize(1);
        verify(appointmentRepository).findByDoctorAndAppointmentDateTimeBetween(
            eq(doctor), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Should get upcoming appointments")
    void testGetUpcomingAppointments() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findByDoctorAndAppointmentDateTimeAfter(eq(doctor), any(LocalDateTime.class)))
            .thenReturn(Arrays.asList(appointment));

        // When
        List<Appointment> result = appointmentService.getUpcomingAppointments(1);

        // Then
        assertThat(result).hasSize(1);
        verify(appointmentRepository).findByDoctorAndAppointmentDateTimeAfter(eq(doctor), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Should create appointment successfully")
    void testCreateAppointment() {
        // Given
        CreateAppointmentInput input = new CreateAppointmentInput();
        input.setFamilyID(1);
        input.setMemberID(1);
        input.setTitle("New Appointment");
        input.setType(AppointmentType.GENERAL_CHECKUP);
        input.setAppointmentDateTime(LocalDateTime.now().plusDays(1).atOffset(ZoneOffset.ofHours(7)));
        input.setDuration(30);
        input.setLocation("Test Clinic");
        input.setNotes("Test notes");

        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(familyRepository.findById(1)).thenReturn(Optional.of(family));
        when(memberRepository.findById(1)).thenReturn(Optional.of(member));
        when(appointmentRepository.findPotentiallyOverlappingAppointments(any(), any(), any()))
            .thenReturn(Arrays.asList());
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // When
        Appointment result = appointmentService.createAppointment(input, 1);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should throw exception when creating appointment in the past")
    void testCreateAppointmentInPast() {
        // Given
        CreateAppointmentInput input = new CreateAppointmentInput();
        input.setFamilyID(1);
        input.setMemberID(1);
        input.setTitle("Past Appointment");
        input.setAppointmentDateTime(LocalDateTime.now().minusDays(1).atOffset(ZoneOffset.ofHours(7)));
        input.setDuration(30);

        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(familyRepository.findById(1)).thenReturn(Optional.of(family));
        when(memberRepository.findById(1)).thenReturn(Optional.of(member));

        // When & Then
        assertThatThrownBy(() -> appointmentService.createAppointment(input, 1))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Appointment datetime cannot be in the past");
    }

    @Test
    @DisplayName("Should throw exception when duration is invalid")
    void testCreateAppointmentInvalidDuration() {
        // Given
        CreateAppointmentInput input = new CreateAppointmentInput();
        input.setFamilyID(1);
        input.setMemberID(1);
        input.setTitle("Invalid Duration");
        input.setAppointmentDateTime(LocalDateTime.now().plusDays(1).atOffset(ZoneOffset.ofHours(7)));
        input.setDuration(500); // Invalid: > 480

        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(familyRepository.findById(1)).thenReturn(Optional.of(family));
        when(memberRepository.findById(1)).thenReturn(Optional.of(member));

        // When & Then
        assertThatThrownBy(() -> appointmentService.createAppointment(input, 1))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Duration must be between 1 and 480 minutes");
    }

    @Test
    @DisplayName("Should throw exception when appointments overlap")
    void testCreateAppointmentWithOverlap() {
        // Given
        CreateAppointmentInput input = new CreateAppointmentInput();
        input.setFamilyID(1);
        input.setMemberID(1);
        input.setTitle("Overlapping Appointment");
        input.setAppointmentDateTime(LocalDateTime.now().plusDays(1).atOffset(ZoneOffset.ofHours(7)));
        input.setDuration(30);

        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(familyRepository.findById(1)).thenReturn(Optional.of(family));
        when(memberRepository.findById(1)).thenReturn(Optional.of(member));
        when(appointmentRepository.findPotentiallyOverlappingAppointments(any(), any(), any()))
            .thenReturn(Arrays.asList(appointment)); // Overlapping appointment exists

        // When & Then
        assertThatThrownBy(() -> appointmentService.createAppointment(input, 1))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Doctor has overlapping appointment at this time");
    }

    @Test
    @DisplayName("Should update appointment successfully")
    void testUpdateAppointment() {
        // Given
        UpdateAppointmentInput input = new UpdateAppointmentInput();
        input.setAppointmentID(1);
        input.setTitle("Updated Title");
        input.setDuration(45);

        when(appointmentRepository.findById(1)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // When
        Appointment result = appointmentService.updateAppointment(input, 1);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should throw exception when updating completed appointment")
    void testUpdateCompletedAppointment() {
        // Given
        appointment.setStatus(AppointmentStatus.COMPLETED);
        
        UpdateAppointmentInput input = new UpdateAppointmentInput();
        input.setAppointmentID(1);
        input.setTitle("Updated Title");

        when(appointmentRepository.findById(1)).thenReturn(Optional.of(appointment));

        // When & Then
        assertThatThrownBy(() -> appointmentService.updateAppointment(input, 1))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Cannot update completed appointment");
    }

    @Test
    @DisplayName("Should update appointment status")
    void testUpdateAppointmentStatus() {
        // Given
        when(appointmentRepository.findById(1)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // When
        Appointment result = appointmentService.updateAppointmentStatus(1, AppointmentStatus.COMPLETED, 1);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should cancel appointment with reason")
    void testCancelAppointment() {
        // Given
        String reason = "Patient requested cancellation";
        when(appointmentRepository.findById(1)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // When
        Appointment result = appointmentService.cancelAppointment(1, reason, 1);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should get family appointments")
    void testGetFamilyAppointments() {
        // Given
        when(familyRepository.findByHeadOfFamily_UserID(2)).thenReturn(family);
        when(appointmentRepository.findByFamilyOrderByAppointmentDateTimeDesc(family))
            .thenReturn(Arrays.asList(appointment));

        // When
        List<PatientAppointment> result = appointmentService.getFamilyAppointments(2);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAppointmentID()).isEqualTo(1);
        assertThat(result.get(0).getTitle()).isEqualTo("General Checkup");
        // Verify doctorNotes is not included in PatientAppointment
    }

    @Test
    @DisplayName("Should throw exception when family not found for user")
    void testGetFamilyAppointmentsNotFound() {
        // Given
        when(familyRepository.findByHeadOfFamily_UserID(999)).thenReturn(null);

        // When & Then
        assertThatThrownBy(() -> appointmentService.getFamilyAppointments(999))
            .isInstanceOf(NotFoundException.class)
            .hasMessageContaining("Family not found for user");
    }

    @Test
    @DisplayName("Should throw exception when doctor not found")
    void testValidateDoctorNotFound() {
        // Given
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> appointmentService.getAppointments(999, null))
            .isInstanceOf(NotFoundException.class)
            .hasMessageContaining("Doctor not found");
    }

    @Test
    @DisplayName("Should throw exception when family not found during creation")
    void testCreateAppointmentFamilyNotFound() {
        // Given
        CreateAppointmentInput input = new CreateAppointmentInput();
        input.setFamilyID(999);
        input.setMemberID(1);
        input.setAppointmentDateTime(LocalDateTime.now().plusDays(1).atOffset(ZoneOffset.ofHours(7)));
        input.setDuration(30);

        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(familyRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> appointmentService.createAppointment(input, 1))
            .isInstanceOf(NotFoundException.class)
            .hasMessageContaining("Family not found");
    }

    @Test
    @DisplayName("Should throw exception when member not found during creation")
    void testCreateAppointmentMemberNotFound() {
        // Given
        CreateAppointmentInput input = new CreateAppointmentInput();
        input.setFamilyID(1);
        input.setMemberID(999);
        input.setAppointmentDateTime(LocalDateTime.now().plusDays(1).atOffset(ZoneOffset.ofHours(7)));
        input.setDuration(30);

        when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(familyRepository.findById(1)).thenReturn(Optional.of(family));
        when(memberRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> appointmentService.createAppointment(input, 1))
            .isInstanceOf(NotFoundException.class)
            .hasMessageContaining("Member not found");
    }
}
