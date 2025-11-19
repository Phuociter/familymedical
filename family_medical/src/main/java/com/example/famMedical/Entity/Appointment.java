package com.example.famMedical.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "Appointment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer appointmentID;

    @ManyToOne
    @JoinColumn(name = "doctorID", nullable = false)
    private User doctor;

    @ManyToOne
    @JoinColumn(name = "familyID", nullable = false)
    private Family family;

    @ManyToOne
    @JoinColumn(name = "memberID", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    private AppointmentType type;

    @Column(nullable = false)
    private LocalDateTime appointmentDateTime;

    @Column(nullable = false)
    private Integer duration; // in minutes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @lombok.Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String notes; // Public notes for patients

    @Column(columnDefinition = "TEXT")
    private String doctorNotes; // Private notes for doctors only

    @Column(nullable = false, updatable = false)
    @lombok.Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to calculate end time
    public LocalDateTime getEndTime() {
        return appointmentDateTime.plusMinutes(duration);
    }

    public enum AppointmentStatus {
        SCHEDULED,
        COMPLETED,
        CANCELLED
    }
}
