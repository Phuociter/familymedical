package com.example.famMedical.dto;

import com.example.famMedical.Entity.Appointment.AppointmentStatus;
import com.example.famMedical.Entity.AppointmentType;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAppointment {
    private Integer appointmentID;
    private String title;
    private AppointmentType type;
    private LocalDateTime appointmentDateTime;
    private Integer duration;
    private AppointmentStatus status;
    private String location;
    private String notes;
    private User doctor;
    private Member member;
    private LocalDateTime createdAt;
}
