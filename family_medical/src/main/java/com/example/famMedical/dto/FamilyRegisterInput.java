package com.example.famMedical.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class FamilyRegisterInput {
    @NotBlank(message = "Họ và Tên không được để trống")
    @Size(max = 100, message = "Họ và Tên không quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Tên gia đình không được để trống")
    private String familyName;

    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0")
    private String phoneNumber;
    private String address;

    @Pattern(regexp = "^[0-9]{12}$", message = "CCCD phải có đúng 12 chữ số")
    private String cccd;

}