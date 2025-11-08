package com.example.famMedical.controller;

import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.dto.FileDownload;
import com.example.famMedical.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @QueryMapping
    @PreAuthorize("hasRole('BacSi')")
    public List<Family> getMyPatientsFamily() {
        return doctorService.getMyPatientsFamily();
    }

    @QueryMapping
    @PreAuthorize("hasRole('BacSi')")
    public Member getDetailPatient(@Argument Integer memberId) {
        return doctorService.getDetailPatient(memberId);
    }

    @QueryMapping
    @PreAuthorize("hasRole('BacSi')")
    public DoctorRequest getRequestForDocter() {
        return doctorService.getRequestForDoctor();
    }

    @QueryMapping
    @PreAuthorize("hasRole('BacSi')")
    public FileDownload downloadMedicalRecordFile(@Argument String recordId) {
        return doctorService.downloadMedicalRecordFile(recordId);
    }
}