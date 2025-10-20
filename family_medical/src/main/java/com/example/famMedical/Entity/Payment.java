package com.example.famMedical.Entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentID;

    @ManyToOne
    @JoinColumn(name = "familyID")
    private Family family;

    @ManyToOne
    @JoinColumn(name = "doctorID")
    private User doctor;

    private Double amount;
    private String paymentMethod;
    private String status; // SUCCESS, FAILED, PENDING
    private LocalDateTime paymentDate;
}

