package com.example.famMedical.dto;

import com.example.famMedical.Entity.Appointment.AppointmentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentFilter {
    private AppointmentStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer familyID;
    private Integer memberID;
}
