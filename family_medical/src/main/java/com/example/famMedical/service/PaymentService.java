package com.example.famMedical.service;

import com.example.famMedical.Entity.Payment;
import com.example.famMedical.Entity.User;
import com.example.famMedical.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment createPayment(User user, Payment.PackageType packageType, BigDecimal amount, String transactionCode) {
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPackageType(packageType);
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod("MoMo");
        payment.setPaymentStatus(Payment.PaymentStatus.Pending);
        payment.setTransactionCode(transactionCode);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        LocalDateTime expiryDate;
        switch (packageType) {
            case ONE_MONTH:
                expiryDate = payment.getPaymentDate().plusMonths(1);
                break;
            case SIX_MONTHS:
                expiryDate = payment.getPaymentDate().plusMonths(6);
                break;
            case ONE_YEAR:
                expiryDate = payment.getPaymentDate().plusYears(1);
                break;
            default:
                throw new IllegalArgumentException("Invalid package type");
        }
        payment.setExpiryDate(expiryDate);

        return paymentRepository.save(payment);
    }

    public Payment updatePaymentStatusByTransactionCode(String transactionCode, Payment.PaymentStatus newStatus) {
        Optional<Payment> optionalPayment = paymentRepository.findByTransactionCode(transactionCode);
        if (optionalPayment.isPresent()) {
            Payment payment = optionalPayment.get();
            payment.setPaymentStatus(newStatus);
            payment.setUpdatedAt(LocalDateTime.now());
            return paymentRepository.save(payment);
        } else {
            throw new RuntimeException("Payment with transaction code " + transactionCode + " not found.");
        }
    }

    public List<Payment> getPaymentsByUserId(int userId) {
        return paymentRepository.findByUser_UserID(userId);
    }
}
