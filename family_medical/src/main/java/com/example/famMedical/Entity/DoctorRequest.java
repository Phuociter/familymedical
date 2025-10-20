package com.example.famMedical.Entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DoctorRequests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer requestID;

    @ManyToOne
    @JoinColumn(name = "familyID")
    private Family family;

    @ManyToOne
    @JoinColumn(name = "doctorID")
    private User doctor;

    private String message;

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // PENDING, ACCEPTED, REJECTED

    private LocalDateTime requestDate;

    
    public enum RequestStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}

