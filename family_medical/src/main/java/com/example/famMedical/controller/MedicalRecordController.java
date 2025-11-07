package com.example.famMedical.controller;


import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @QueryMapping
    public List<MedicalRecord> getAllMedicalRecords() {
        return medicalRecordService.getAllRecords();
    }

    @QueryMapping
    public Optional<MedicalRecord> getMedicalRecordById(Integer recordID) {
        return medicalRecordService.getRecordById(recordID);
    }

    @QueryMapping
    public List<MedicalRecord> getMedicalRecordsByMemberId(Integer memberID) {
        return medicalRecordService.getRecordsByMemberId(memberID);
    }

    @MutationMapping
    public MedicalRecord createMedicalRecord(MedicalRecord record) {
        return medicalRecordService.createRecord(record);
    }

    @MutationMapping
    public MedicalRecord updateMedicalRecord(MedicalRecord record) {
        return medicalRecordService.updateRecord(record);
    }

    @MutationMapping
    public Boolean deleteMedicalRecord(Integer recordID) {
        medicalRecordService.deleteRecord(recordID);
        return true;
    }
}

