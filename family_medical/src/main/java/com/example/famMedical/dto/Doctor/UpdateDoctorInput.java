package com.example.famMedical.dto.Doctor;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class UpdateDoctorInput {

    @Size(min = 2, max = 100, message = "Họ tên phải có từ 2 đến 100 ký tự")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Họ tên chỉ được chứa chữ cái và khoảng trắng")
    private String fullName;

    @Pattern(
        regexp = "^$|^(\\+84|0)[3|5|7|8|9][0-9]{8}$", 
        message = "Số điện thoại không hợp lệ (VD: 0912345678)"
    )
    private String phoneNumber;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Pattern(
        regexp = "^$|^[0-9]{9}$|^[0-9]{12}$", 
        message = "CCCD phải có 9 hoặc 12 chữ số"
    )
    private String cccd;

    @Size(max = 255, message = "URL avatar không được vượt quá 255 ký tự")
    @Pattern(
        regexp = "^$|^https?://.*\\.(jpg|jpeg|png|gif|webp)$", 
        message = "URL avatar phải hợp lệ"
    )
    private String avatarUrl;

    @Pattern(
        regexp = "^$|^[A-Z0-9]{5,20}$", 
        message = "Mã bác sĩ phải từ 5-20 ký tự viết hoa và số"
    )
    private String doctorCode;

    @Size(min = 2, max = 255, message = "Tên bệnh viện phải từ 2-255 ký tự")
    private String hospitalName;

    @Pattern(
        regexp = "^$|^[0-9]{1,2}$", 
        message = "Số năm kinh nghiệm phải từ 0-99"
    )
    private String yearsOfExperience;

    // Helper: kiểm tra field có được gửi trong request không
    public boolean hasField(String fieldName) {
        try {
            var field = this.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(this) != null;
        } catch (Exception e) {
            return false;
        }
    }
}