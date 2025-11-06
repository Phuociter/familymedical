package com.example.famMedical.controller;

import com.example.famMedical.Entity.Payment;
import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.MomoPaymentResponse;
import com.example.famMedical.service.MomoService;
import com.example.famMedical.service.PaymentService;
import com.example.famMedical.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class PaymentGraphQLResolver {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserService userService;

    @Autowired
    private MomoService momoService;

    @MutationMapping
    public MomoPaymentResponse createMomoPayment(@Argument int userId, @Argument Payment.PackageType packageType, @Argument BigDecimal amount) {
        User user = userService.getUserById(userId);
        String orderId = UUID.randomUUID().toString();
        String orderInfo = "Thanh toan goi " + packageType.name() + " cho nguoi dung " + user.getEmail();


        paymentService.createPayment(user, packageType, amount, orderId);


        Map<String, Object> momoResponse = momoService.createPayment(orderId, amount.longValue(), orderInfo, String.valueOf(userId));

        String payUrl = (String) momoResponse.get("payUrl");
        String message = (String) momoResponse.get("message");

        return new MomoPaymentResponse(payUrl, orderId, message);
    }

    @MutationMapping
    public Payment updateMomoPaymentStatus(@Argument String orderId, @Argument int resultCode) {
        Payment.PaymentStatus newStatus = (resultCode == 0) ? Payment.PaymentStatus.Completed : Payment.PaymentStatus.Failed;
        return paymentService.updatePaymentStatusByTransactionCode(orderId, newStatus);
    }

    @QueryMapping
    public List<Payment> getPaymentsByUserId(@Argument int userId) {
        return paymentService.getPaymentsByUserId(userId);
    }
}
