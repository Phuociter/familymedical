package com.example.famMedical.dto.Doctor;

import java.util.List;

import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.MedicalRecord;

public record DoctorDashboard(
    // Tong quan
    Integer assignedFamiliesCount,
    Integer pendingRequestsCount,
    Integer recentRecordsCount,
    Integer totalPatientsCount,

    List<MedicalRecord> recentMedicalRecords,
    List<DoctorRequest> pendingRequests,
    List<Family> assignedFamilies,

    List<WeeklyStat> weeklyStat
) {}