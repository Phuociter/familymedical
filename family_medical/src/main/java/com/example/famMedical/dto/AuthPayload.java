package com.example.famMedical.dto;

import com.example.famMedical.Entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthPayload {
    private String token; // JWT Token
    private User user;    // Thông tin cơ bản của User
}