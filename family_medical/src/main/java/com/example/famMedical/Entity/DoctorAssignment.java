package com.example.famMedical.Entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DoctorAssignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer assignmentID;

    @ManyToOne
    @JoinColumn(name = "doctorID")
    private User doctor;

    @ManyToOne
    @JoinColumn(name = "familyID")
    private Family family;

    @Enumerated(EnumType.STRING)
    private AssignmentStatus status; // ACTIVE, INACTIVE
    public enum AssignmentStatus {
    ACTIVE,
    INACTIVE
}
}
