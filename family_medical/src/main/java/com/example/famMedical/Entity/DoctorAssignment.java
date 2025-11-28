package com.example.famMedical.Entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
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
    
    @Column(name = "StartDate")
    private LocalDateTime startDate;

    @Enumerated(EnumType.STRING)
    private AssignmentStatus status; // ACTIVE, INACTIVE
    public enum AssignmentStatus {
    ACTIVE,
    INACTIVE
}
}
