package com.example.famMedical.dto;

import lombok.Data;

@Data
public class UpdateUserInput {

    private String email;

    private String fullName;

    private String phoneNumber;
    
    private String cccd;

    private String avatarUrl;

    private String address;
}