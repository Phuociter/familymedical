package com.example.famMedical.dto;

import com.example.famMedical.Entity.AppointmentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateAppointmentInput {
    private Integer familyID;
    private Integer memberID;
    private String title;
    private AppointmentType type;
    private LocalDateTime appointmentDateTime;
    private Integer duration;
    private String location;
    private String notes;
    private String doctorNotes;
}
