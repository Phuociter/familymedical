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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "familyID")
    private Family family;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctorID")
    private User doctor;

    private String message;

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // pending, accepted, rejected

    private LocalDateTime requestDate;

    
    public enum RequestStatus {
        pending,
        accepted,
        rejected
    }
}

