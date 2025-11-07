package com.example.famMedical.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private int paymentId;

    @ManyToOne
    @JoinColumn(name = "UserID", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "PackageType", nullable = false)
    private PackageType packageType;

    @Column(name = "Amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "PaymentDate")
    private LocalDateTime paymentDate;

    @Column(name = "ExpiryDate", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "PaymentMethod", length = 50)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "PaymentStatus")
    private PaymentStatus paymentStatus;

    @Column(name = "TransactionCode", length = 100)
    private String transactionCode;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    public enum PackageType {
        ONE_MONTH,
        SIX_MONTHS,
        ONE_YEAR
    }

    public enum PaymentStatus {
        Completed,
        Failed,
        Pending
    }
}