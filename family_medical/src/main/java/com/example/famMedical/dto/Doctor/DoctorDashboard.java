package com.example.famMedical.dto.Doctor;

import com.example.famMedical.Entity.Appointment;
import com.example.famMedical.Entity.DoctorRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDashboard {
    private DoctorStats stats;
    private List<WeeklyStats> weeklyStats;
    private List<Activity> recentActivities;
    private List<Appointment> todayAppointments;
    private List<DoctorRequest> pendingRequests;
}
