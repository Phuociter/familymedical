package com.example.famMedical.resolver;


import com.example.famMedical.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import com.example.famMedical.Entity.Payment;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class PaymentQueryResolver {

    private final PaymentRepository paymentRepository;

    @QueryMapping
    public List<Payment> getPaymentOnByUserId(@Argument Integer userId) {
        System.out.println("Fetching valid payments for userId: " + paymentRepository.findByUser_UserId(userId).size());
        return paymentRepository.findByUser_UserId(userId);
    }
}


