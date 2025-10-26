package com.example.famMedical.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DoctorRegisterInput {
    @NotBlank(message = "Họ và Tên không được để trống")
    @Size(max = 100, message = "Họ và Tên không quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Mã bác sĩ không được để trống")
    private String doctorCode;

    private String phoneNumber;
    private String address;
    private String cccd;
}