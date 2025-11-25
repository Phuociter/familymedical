package com.example.famMedical.dto;

import lombok.Data;

@Data
public class ChangePasswordInput {
    private String currentPassword;
    private String newPassword;
}
