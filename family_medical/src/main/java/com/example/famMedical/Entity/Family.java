package com.example.famMedical.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "Family")
@Data
@NoArgsConstructor
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FamilyID")
    private Integer familyID;

    @Column(name = "FamilyName", nullable = false, length = 100)
    private String familyName;

    @Column(name = "Address", length = 255)
    private String address;


    @OneToOne
    @JoinColumn(name = "HeadOfFamilyID", referencedColumnName = "UserID")
    private User headOfFamily;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Member> members;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DoctorAssignment> doctorAssignments;
}