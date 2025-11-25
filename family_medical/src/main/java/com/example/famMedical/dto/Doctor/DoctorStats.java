package com.example.famMedical.dto.Doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorStats {
    private Integer totalFamilies;
    private Integer totalPatients;
    private Integer newRecordsThisMonth;
    private Integer todayAppointments;
    private Integer pendingRequests;
}
