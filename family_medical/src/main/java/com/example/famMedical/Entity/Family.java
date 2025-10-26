package com.example.famMedical.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "family")
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
    private LocalDateTime createdAt = LocalDateTime.now();
}