package com.example.famMedical.Entity;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DoctorRequests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DoctorRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer requestID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "familyID")
    @JsonIgnoreProperties({"members", "doctorAssignments", "createdAt"})
    private Family family;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctorID")
    @JsonIgnoreProperties({"passwordHash", "role", "isVerified", "isLocked", "doctorCode"})
    private User doctor;

    private String message;

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // Pending, Accepted, Rejected

    private LocalDateTime requestDate;
    
    private LocalDateTime responseDate;
    
    private String responseMessage;

    
    public enum RequestStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}

