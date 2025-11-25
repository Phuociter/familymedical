package com.example.famMedical.repository;

import com.example.famMedical.Entity.*;
import com.example.famMedical.Entity.Appointment.AppointmentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("AppointmentRepository Tests")
class AppointmentRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private User doctor;
    private Family family;
    private Member member;

    @BeforeEach
    void setUp() {
        // Create and persist doctor
        doctor = new User();
        doctor.setFullName("Dr. John Doe");
        doctor.setEmail("doctor@test.com");
        doctor.setPasswordHash("hashedPassword");
        doctor.setRole(UserRole.BacSi);
        doctor.setPhoneNumber("0123456789");
        doctor.setHospitalName("Test Hospital");
        doctor.setYearsOfExperience("5");
        doctor.setProfileComplete(true);
        entityManager.persist(doctor);

        // Create and persist head of family
        User headOfFamily = new User();
        headOfFamily.setFullName("Head of Family");
        headOfFamily.setEmail("head@test.com");
        headOfFamily.setPasswordHash("hashedPassword");
        headOfFamily.setRole(UserRole.ChuHo);
        headOfFamily.setPhoneNumber("0987654321");
        headOfFamily.setHospitalName("N/A");
        headOfFamily.setYearsOfExperience("0");
        entityManager.persist(headOfFamily);

        // Create and persist family
        family = new Family();
        family.setFamilyName("Test Family");
        family.setAddress("123 Test Street");
        family.setHeadOfFamily(headOfFamily);
        entityManager.persist(family);

        // Create and persist member
        member = new Member();
        member.setFamily(family);
        member.setFullName("John Member");
        member.setDateOfBirth(LocalDate.of(1990, 1, 1));
        member.setGender(Member.Gender.Nam);
        member.setRelationship("Son");
        member.setPhoneNumber("0111222333");
        entityManager.persist(member);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should save and find appointment by ID")
    void testSaveAndFindById() {
        // Given
        Appointment appointment = createAppointment(
            "General Checkup",
            AppointmentType.GENERAL_CHECKUP,
            LocalDateTime.now().plusDays(1),
            30,
            AppointmentStatus.SCHEDULED
        );

        // When
        Appointment saved = appointmentRepository.save(appointment);
        Appointment found = appointmentRepository.findById(saved.getAppointmentID()).orElse(null);

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getTitle()).isEqualTo("General Checkup");
        assertThat(found.getDoctor().getUserID()).isEqualTo(doctor.getUserID());
        assertThat(found.getFamily().getFamilyID()).isEqualTo(family.getFamilyID());
        assertThat(found.getMember().getMemberID()).isEqualTo(member.getMemberID());
    }

    @Test
    @DisplayName("Should find appointments by doctor and status")
    void testFindByDoctorAndStatus() {
        // Given
        createAndSaveAppointment("Appointment 1", AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Appointment 2", AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Appointment 3", AppointmentStatus.COMPLETED);

        // When
        List<Appointment> scheduled = appointmentRepository.findByDoctorAndStatus(doctor, AppointmentStatus.SCHEDULED);
        List<Appointment> completed = appointmentRepository.findByDoctorAndStatus(doctor, AppointmentStatus.COMPLETED);

        // Then
        assertThat(scheduled).hasSize(2);
        assertThat(completed).hasSize(1);
    }

    @Test
    @DisplayName("Should find appointments by doctor and date range")
    void testFindByDoctorAndAppointmentDateTimeBetween() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        createAndSaveAppointment("Today", now.plusHours(2), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Tomorrow", now.plusDays(1), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Next Week", now.plusDays(7), AppointmentStatus.SCHEDULED);

        // When
        LocalDateTime start = now;
        LocalDateTime end = now.plusDays(2);
        List<Appointment> appointments = appointmentRepository.findByDoctorAndAppointmentDateTimeBetween(
            doctor, start, end
        );

        // Then
        assertThat(appointments).hasSize(2);
    }

    @Test
    @DisplayName("Should find appointments after specific date")
    void testFindByDoctorAndAppointmentDateTimeAfter() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        createAndSaveAppointment("Past", now.minusDays(1), AppointmentStatus.COMPLETED);
        createAndSaveAppointment("Future 1", now.plusDays(1), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Future 2", now.plusDays(2), AppointmentStatus.SCHEDULED);

        // When
        List<Appointment> futureAppointments = appointmentRepository.findByDoctorAndAppointmentDateTimeAfter(
            doctor, now
        );

        // Then
        assertThat(futureAppointments).hasSize(2);
    }

    @Test
    @DisplayName("Should find appointments ordered by date ascending")
    void testFindByDoctorOrderByAppointmentDateTimeAsc() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        createAndSaveAppointment("Third", now.plusDays(3), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("First", now.plusDays(1), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Second", now.plusDays(2), AppointmentStatus.SCHEDULED);

        // When
        List<Appointment> appointments = appointmentRepository.findByDoctorOrderByAppointmentDateTimeAsc(doctor);

        // Then
        assertThat(appointments).hasSize(3);
        assertThat(appointments.get(0).getTitle()).isEqualTo("First");
        assertThat(appointments.get(1).getTitle()).isEqualTo("Second");
        assertThat(appointments.get(2).getTitle()).isEqualTo("Third");
    }

    @Test
    @DisplayName("Should find appointments by family ordered by date descending")
    void testFindByFamilyOrderByAppointmentDateTimeDesc() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        createAndSaveAppointment("First", now.plusDays(1), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Second", now.plusDays(2), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Third", now.plusDays(3), AppointmentStatus.SCHEDULED);

        // When
        List<Appointment> appointments = appointmentRepository.findByFamilyOrderByAppointmentDateTimeDesc(family);

        // Then
        assertThat(appointments).hasSize(3);
        assertThat(appointments.get(0).getTitle()).isEqualTo("Third");
        assertThat(appointments.get(1).getTitle()).isEqualTo("Second");
        assertThat(appointments.get(2).getTitle()).isEqualTo("First");
    }

    @Test
    @DisplayName("Should find appointments by member ordered by date descending")
    void testFindByMemberOrderByAppointmentDateTimeDesc() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        createAndSaveAppointment("Appointment 1", now.plusDays(1), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Appointment 2", now.plusDays(2), AppointmentStatus.SCHEDULED);

        // When
        List<Appointment> appointments = appointmentRepository.findByMemberOrderByAppointmentDateTimeDesc(member);

        // Then
        assertThat(appointments).hasSize(2);
        assertThat(appointments.get(0).getAppointmentDateTime()).isAfter(
            appointments.get(1).getAppointmentDateTime()
        );
    }

    @Test
    @DisplayName("Should find appointments with filter")
    void testFindByDoctorWithFilter() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        createAndSaveAppointment("Scheduled Today", now.plusHours(2), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Scheduled Tomorrow", now.plusDays(1), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Completed", now.minusDays(1), AppointmentStatus.COMPLETED);

        // When - Filter by status only
        List<Appointment> scheduled = appointmentRepository.findByDoctorWithFilter(
            doctor, AppointmentStatus.SCHEDULED, null, null
        );

        // When - Filter by date range
        List<Appointment> todayAppointments = appointmentRepository.findByDoctorWithFilter(
            doctor, null, now, now.plusHours(12)
        );

        // Then
        assertThat(scheduled).hasSize(2);
        assertThat(todayAppointments).hasSize(1);
    }

    @Test
    @DisplayName("Should find potentially overlapping appointments")
    void testFindPotentiallyOverlappingAppointments() {
        // Given
        LocalDateTime startTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        
        // Create appointment from 10:00 to 10:30
        createAndSaveAppointment("Existing", startTime, 30, AppointmentStatus.SCHEDULED);

        // When - Check for potential overlaps (appointments that start before 10:45)
        LocalDateTime newEnd = startTime.plusMinutes(45);
        
        List<Appointment> potentialOverlaps = appointmentRepository.findPotentiallyOverlappingAppointments(
            doctor, newEnd, AppointmentStatus.SCHEDULED
        );

        // Then - Should find the existing appointment as it starts before 10:45
        assertThat(potentialOverlaps).hasSize(1);
        assertThat(potentialOverlaps.get(0).getTitle()).isEqualTo("Existing");
    }

    @Test
    @DisplayName("Should not find potentially overlapping appointments when appointment is after")
    void testNoPotentiallyOverlappingAppointments() {
        // Given
        LocalDateTime startTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        
        // Create appointment from 10:00 to 10:30
        createAndSaveAppointment("Existing", startTime, 30, AppointmentStatus.SCHEDULED);

        // When - Check for potential overlaps before 10:00
        LocalDateTime newEnd = startTime.minusMinutes(30);
        
        List<Appointment> potentialOverlaps = appointmentRepository.findPotentiallyOverlappingAppointments(
            doctor, newEnd, AppointmentStatus.SCHEDULED
        );

        // Then - Should not find any as existing appointment starts at 10:00
        assertThat(potentialOverlaps).isEmpty();
    }

    @Test
    @DisplayName("Should count appointments by doctor and date range")
    void testCountByDoctorAndAppointmentDateTimeBetween() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        createAndSaveAppointment("Today 1", now.plusHours(2), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Today 2", now.plusHours(4), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Tomorrow", now.plusDays(1), AppointmentStatus.SCHEDULED);

        // When
        int count = appointmentRepository.countByDoctorAndAppointmentDateTimeBetween(
            doctor, now, now.plusHours(12)
        );

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Should count appointments by doctor and status")
    void testCountByDoctorAndStatus() {
        // Given
        createAndSaveAppointment("Scheduled 1", AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Scheduled 2", AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Completed", AppointmentStatus.COMPLETED);
        createAndSaveAppointment("Cancelled", AppointmentStatus.CANCELLED);

        // When
        int scheduledCount = appointmentRepository.countByDoctorAndStatus(doctor, AppointmentStatus.SCHEDULED);
        int completedCount = appointmentRepository.countByDoctorAndStatus(doctor, AppointmentStatus.COMPLETED);
        int cancelledCount = appointmentRepository.countByDoctorAndStatus(doctor, AppointmentStatus.CANCELLED);

        // Then
        assertThat(scheduledCount).isEqualTo(2);
        assertThat(completedCount).isEqualTo(1);
        assertThat(cancelledCount).isEqualTo(1);
    }

    @Test
    @DisplayName("Should count appointments by doctor and date range using custom query")
    void testCountByDoctorAndDateRange() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        createAndSaveAppointment("This Week 1", now.plusDays(1), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("This Week 2", now.plusDays(3), AppointmentStatus.SCHEDULED);
        createAndSaveAppointment("Next Week", now.plusDays(8), AppointmentStatus.SCHEDULED);

        // When
        int thisWeekCount = appointmentRepository.countByDoctorAndDateRange(
            doctor, now, now.plusDays(7)
        );

        // Then
        assertThat(thisWeekCount).isEqualTo(2);
    }

    @Test
    @DisplayName("Should find top 5 recent appointments")
    void testFindTop5ByDoctorOrderByCreatedAtDesc() {
        // Given - Create 7 appointments
        for (int i = 1; i <= 7; i++) {
            createAndSaveAppointment("Appointment " + i, AppointmentStatus.SCHEDULED);
            try {
                Thread.sleep(10); // Small delay to ensure different createdAt times
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        // When
        List<Appointment> recentAppointments = appointmentRepository.findTop5ByDoctorOrderByCreatedAtDesc(doctor);

        // Then
        assertThat(recentAppointments).hasSize(5);
    }

    // Helper methods
    private Appointment createAppointment(String title, AppointmentType type, 
                                         LocalDateTime dateTime, Integer duration, 
                                         AppointmentStatus status) {
        return Appointment.builder()
            .doctor(doctor)
            .family(family)
            .member(member)
            .title(title)
            .type(type)
            .appointmentDateTime(dateTime)
            .duration(duration)
            .status(status)
            .location("Test Clinic")
            .notes("Test notes")
            .doctorNotes("Test doctor notes")
            .build();
    }

    private void createAndSaveAppointment(String title, AppointmentStatus status) {
        Appointment appointment = createAppointment(
            title,
            AppointmentType.GENERAL_CHECKUP,
            LocalDateTime.now().plusDays(1),
            30,
            status
        );
        appointmentRepository.save(appointment);
    }

    private void createAndSaveAppointment(String title, LocalDateTime dateTime, AppointmentStatus status) {
        Appointment appointment = createAppointment(
            title,
            AppointmentType.GENERAL_CHECKUP,
            dateTime,
            30,
            status
        );
        appointmentRepository.save(appointment);
    }

    private void createAndSaveAppointment(String title, LocalDateTime dateTime, 
                                         Integer duration, AppointmentStatus status) {
        Appointment appointment = createAppointment(
            title,
            AppointmentType.GENERAL_CHECKUP,
            dateTime,
            duration,
            status
        );
        appointmentRepository.save(appointment);
    }
}
