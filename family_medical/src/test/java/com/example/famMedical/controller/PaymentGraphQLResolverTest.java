package com.example.famMedical.controller;

import com.example.famMedical.Entity.Payment;
import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.MomoPaymentResponse;
import com.example.famMedical.service.MomoService;
import com.example.famMedical.service.PaymentService;
import com.example.famMedical.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

class PaymentGraphQLResolverTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private UserService userService;

    @Mock
    private MomoService momoService;

    @InjectMocks
    private PaymentGraphQLResolver paymentGraphQLResolver;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createMomoPayment_Success() {
        // Arrange
        int userId = 1;
        Payment.PackageType packageType = Payment.PackageType.ONE_MONTH;
        BigDecimal amount = new BigDecimal("100000");
        User user = new User();
        user.setUserID(userId);
        user.setEmail("test@example.com");
        
        Map<String, Object> momoResponseMap = new HashMap<>();
        momoResponseMap.put("payUrl", "https://test.momo.vn/pay");
        momoResponseMap.put("message", "Success");

        when(userService.getUserById(userId)).thenReturn(user);
        when(momoService.createPayment(anyString(), anyLong(), anyString(), anyString())).thenReturn(momoResponseMap);

        // Act
        MomoPaymentResponse response = paymentGraphQLResolver.createMomoPayment(userId, packageType, amount);

        // Assert
        assertNotNull(response);
        assertEquals("https://test.momo.vn/pay", response.getPayUrl());
        assertEquals("Success", response.getMessage());
        assertNotNull(response.getOrderId());
        
        verify(userService, times(1)).getUserById(userId);
        verify(paymentService, times(1)).createPayment(any(User.class), any(Payment.PackageType.class), any(BigDecimal.class), anyString());
        verify(momoService, times(1)).createPayment(anyString(), anyLong(), anyString(), anyString());
    }

    @Test
    void updateMomoPaymentStatus_Completed() {
        // Arrange
        String orderId = "test-order-id";
        int resultCode = 0;
        Payment.PaymentStatus expectedStatus = Payment.PaymentStatus.Completed;
        Payment payment = new Payment();
        payment.setPaymentStatus(expectedStatus);

        when(paymentService.updatePaymentStatusByTransactionCode(orderId, expectedStatus)).thenReturn(payment);

        // Act
        Payment result = paymentGraphQLResolver.updateMomoPaymentStatus(orderId, resultCode);

        // Assert
        assertNotNull(result);
        assertEquals(expectedStatus, result.getPaymentStatus());
        verify(paymentService, times(1)).updatePaymentStatusByTransactionCode(orderId, expectedStatus);
    }

    @Test
    void updateMomoPaymentStatus_Failed() {
        // Arrange
        String orderId = "test-order-id";
        int resultCode = 1; // Non-zero result code
        Payment.PaymentStatus expectedStatus = Payment.PaymentStatus.Failed;
        Payment payment = new Payment();
        payment.setPaymentStatus(expectedStatus);

        when(paymentService.updatePaymentStatusByTransactionCode(orderId, expectedStatus)).thenReturn(payment);

        // Act
        Payment result = paymentGraphQLResolver.updateMomoPaymentStatus(orderId, resultCode);

        // Assert
        assertNotNull(result);
        assertEquals(expectedStatus, result.getPaymentStatus());
        verify(paymentService, times(1)).updatePaymentStatusByTransactionCode(orderId, expectedStatus);
    }

    @Test
    void getPaymentsByUserId_Success() {
        // Arrange
        int userId = 1;
        Payment payment = new Payment();
        List<Payment> paymentList = Collections.singletonList(payment);

        when(paymentService.getPaymentsByUserId(userId)).thenReturn(paymentList);

        // Act
        List<Payment> result = paymentGraphQLResolver.getPaymentsByUserId(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(payment, result.get(0));
        verify(paymentService, times(1)).getPaymentsByUserId(userId);
    }
}
