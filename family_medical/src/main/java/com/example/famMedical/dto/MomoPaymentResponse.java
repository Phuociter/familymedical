package com.example.famMedical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MomoPaymentResponse {
    private String payUrl;
    private String orderId;
    private String message;
}
