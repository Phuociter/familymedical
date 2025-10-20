package com.example.famMedical.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "Members")
@Data
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer memberID;

    @ManyToOne
    @JoinColumn(name = "familyID")
    private Family family;

    private String fullName;
    private String relation;
    private String cccd;
    private String healthStatus;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<MedicalRecord> medicalRecords;
}
    

