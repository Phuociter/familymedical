package com.example.famMedical.Entity;


import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private Integer paymentID;

    // UserID là bắt buộc trong database, có thể lấy từ family.headOfFamilyID
    @Column(name = "UserID", nullable = false)
    private Integer userID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "familyID")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "headOfFamily"})
    private Family family;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctorID")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User doctor;

    @Column(name = "Amount")
    private Double amount;
    
    @Column(name = "PaymentMethod")
    private String paymentMethod;
    
    @Column(name = "PaymentStatus")
    private String paymentStatus; // COMPLETED, FAILED, PENDING
    
    @Column(name = "PaymentDate")
    private LocalDateTime paymentDate;

    // Getter để trả về familyID (để frontend có thể sử dụng)
    public Integer getFamilyID() {
        return family != null ? family.getFamilyID() : null;
    }

    // Getter để trả về doctorID (để frontend có thể sử dụng)
    public Integer getDoctorID() {
        return doctor != null ? doctor.getUserID() : null;
    }
}

