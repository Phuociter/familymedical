package com.example.famMedical.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "MedicalRecords")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer recordID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "memberID")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "family"})
    private Member member;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctorID", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User doctor;

    private String symptoms;
    private String diagnosis;
    private String treatmentPlan;

    private LocalDateTime recordDate;

    // URL của file PDF được lưu trên cloud (Firebase/S3)
    private String fileLink;
}

