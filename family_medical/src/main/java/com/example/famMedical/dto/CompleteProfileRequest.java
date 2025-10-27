package com.example.famMedical.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteProfileRequest {
    private String familyName;
    private String phoneNumber;
    private String address;
}
