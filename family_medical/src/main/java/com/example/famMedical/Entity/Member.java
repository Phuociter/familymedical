package com.example.famMedical.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "Members")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    @Column(name = "CreatedAt", nullable = true, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = java.time.LocalDateTime.now();
        }
    }

    // Getter cho GraphQL để resolve familyID
    public Integer getFamilyID() {
        return family != null ? family.getFamilyID() : null;
    }

    public enum Gender {
        Nam, Nữ, Khác
    }
}