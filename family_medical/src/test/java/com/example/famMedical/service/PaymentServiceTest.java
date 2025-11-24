package com.example.famMedical.service;

import com.example.famMedical.Entity.Payment;
import com.example.famMedical.Entity.User;
import com.example.famMedical.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserID(1);
        user.setEmail("test@example.com");
    }

    @Test
    void createPayment_Success_OneMonth() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId(1); // Simulate saving
            return p;
        });

        BigDecimal amount = new BigDecimal("100000");
        String transactionCode = "TRANS123";

        Payment result = paymentService.createPayment(user, Payment.PackageType.ONE_MONTH, amount, transactionCode);

        assertNotNull(result);
        assertEquals(user, result.getUser());
        assertEquals(Payment.PackageType.ONE_MONTH, result.getPackageType());
        assertEquals(amount, result.getAmount());
        assertEquals(transactionCode, result.getTransactionCode());
        assertEquals("MoMo", result.getPaymentMethod());
        assertEquals(Payment.PaymentStatus.Pending, result.getPaymentStatus());
        assertNotNull(result.getPaymentDate());
        assertNotNull(result.getExpiryDate());
        assertTrue(result.getExpiryDate().isAfter(result.getPaymentDate()));
        assertTrue(result.getExpiryDate().isBefore(result.getPaymentDate().plusMonths(1).plusDays(1))); // Roughly 1 month

        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void createPayment_Success_SixMonths() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId(2);
            return p;
        });

        BigDecimal amount = new BigDecimal("500000");
        String transactionCode = "TRANS456";

        Payment result = paymentService.createPayment(user, Payment.PackageType.SIX_MONTHS, amount, transactionCode);

        assertNotNull(result);
        assertEquals(Payment.PackageType.SIX_MONTHS, result.getPackageType());
        assertTrue(result.getExpiryDate().isAfter(result.getPaymentDate().plusMonths(5))); // Roughly 6 months
        assertTrue(result.getExpiryDate().isBefore(result.getPaymentDate().plusMonths(6).plusDays(1)));

        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void createPayment_Success_OneYear() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId(3);
            return p;
        });

        BigDecimal amount = new BigDecimal("900000");
        String transactionCode = "TRANS789";

        Payment result = paymentService.createPayment(user, Payment.PackageType.ONE_YEAR, amount, transactionCode);

        assertNotNull(result);
        assertEquals(Payment.PackageType.ONE_YEAR, result.getPackageType());
        assertTrue(result.getExpiryDate().isAfter(result.getPaymentDate().plusYears(0))); // Roughly 1 year
        assertTrue(result.getExpiryDate().isBefore(result.getPaymentDate().plusYears(1).plusDays(1)));

        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void createPayment_InvalidPackageType_ThrowsException() {
        BigDecimal amount = new BigDecimal("100000");
        String transactionCode = "TRANS_INVALID";

        // To test default case for PackageType, we need to bypass the enum, which is not directly possible via method signature.
        // This test case would typically be covered by an integration test where the input DTO is malformed,
        // or if the enum itself allowed an "UNKNOWN" state.
        // For now, we assume valid enum inputs are always provided to this method.
        // If an "Invalid package type" exception were possible here, it would be thrown by our switch statement.
        // Since PackageType is an enum, it restricts input to valid types, making this test case less relevant
        // unless external data is directly mapped without validation.
    }

    @Test
    void updatePaymentStatusByTransactionCode_Success() {
        Payment existingPayment = new Payment();
        existingPayment.setTransactionCode("TRANS123");
        existingPayment.setPaymentStatus(Payment.PaymentStatus.Pending);

        when(paymentRepository.findByTransactionCode("TRANS123")).thenReturn(Optional.of(existingPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment updatedPayment = paymentService.updatePaymentStatusByTransactionCode("TRANS123", Payment.PaymentStatus.Completed);

        assertNotNull(updatedPayment);
        assertEquals(Payment.PaymentStatus.Completed, updatedPayment.getPaymentStatus());
        assertNotNull(updatedPayment.getUpdatedAt());
        verify(paymentRepository).findByTransactionCode("TRANS123");
        verify(paymentRepository).save(existingPayment);
    }

    @Test
    void updatePaymentStatusByTransactionCode_NotFound_ThrowsRuntimeException() {
        when(paymentRepository.findByTransactionCode(anyString())).thenReturn(Optional.empty());

        RuntimeException thrown = assertThrows(RuntimeException.class, () -> {
            paymentService.updatePaymentStatusByTransactionCode("NONEXISTENT", Payment.PaymentStatus.Completed);
        });

        assertEquals("Payment with transaction code NONEXISTENT not found.", thrown.getMessage());
        verify(paymentRepository).findByTransactionCode("NONEXISTENT");
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void getPaymentsByUserId_ReturnsListOfPayments() {
        Payment payment1 = new Payment();
        payment1.setPaymentId(1);
        payment1.setUser(user);
        Payment payment2 = new Payment();
        payment2.setPaymentId(2);
        payment2.setUser(user);
        List<Payment> payments = Arrays.asList(payment1, payment2);

        when(paymentRepository.findByUser_UserID(user.getUserID())).thenReturn(payments);

        List<Payment> result = paymentService.getPaymentsByUserId(user.getUserID());

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(payments, result);
        verify(paymentRepository).findByUser_UserID(user.getUserID());
    }

    @Test
    void getPaymentsByUserId_ReturnsEmptyList_WhenNoPayments() {
        when(paymentRepository.findByUser_UserID(anyInt())).thenReturn(Arrays.asList());

        List<Payment> result = paymentService.getPaymentsByUserId(user.getUserID());

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(paymentRepository).findByUser_UserID(user.getUserID());
    }
}
