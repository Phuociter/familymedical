package com.example.famMedical.dto;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
public class UpdateMemberInput {

    private String fullName;
    private LocalDate dateOfBirth; 
    private Gender gender;
    private String relationship;
    private String phoneNumber;
    private String cccd;

    public enum Gender {
        Nam, Nữ, Khác
    }
}
