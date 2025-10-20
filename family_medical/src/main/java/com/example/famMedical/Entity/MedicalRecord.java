package com.example.famMedical.Entity;

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

    @ManyToOne
    @JoinColumn(name = "memberID")
    private Member member;

    private String symptoms;
    private String diagnosis;
    private String treatmentPlan;

    private LocalDateTime recordDate;

    // URL của file PDF được lưu trên cloud (Firebase/S3)
    private String fileLink;
}

