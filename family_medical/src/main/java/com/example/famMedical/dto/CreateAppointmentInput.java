package com.example.famMedical.dto;

import com.example.famMedical.Entity.AppointmentType;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class CreateAppointmentInput {
    private Integer familyID;
    private Integer memberID;
    private String title;
    private AppointmentType type;
    private OffsetDateTime appointmentDateTime;
    private Integer duration;
    private String location;
    private String notes;
    private String doctorNotes;
}
