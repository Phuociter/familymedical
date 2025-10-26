package com.example.famMedical.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "members")
@Data
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MemberID")
    private Integer memberID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FamilyID", nullable = false)
    private Family family;

    @Column(name = "FullName", nullable = false, length = 100)
    private String fullName;

    @Column(name = "DateOfBirth")
    private LocalDate dateOfBirth; // Sử dụng LocalDate cho kiểu DATE

    @Enumerated(EnumType.STRING)
    @Column(name = "Gender")
    private Gender gender;

    @Column(name = "CCCD", length = 20)
    private String cccd;

    @Column(name = "Relationship", length = 50)
    private String relationship;

    @Column(name = "PhoneNumber", length = 20)
    private String phoneNumber;

    public enum Gender {
        Nam, Nữ, Khác
    }
}