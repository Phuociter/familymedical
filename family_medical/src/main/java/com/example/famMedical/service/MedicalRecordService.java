package com.example.famMedical.service;


import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;

    public List<MedicalRecord> getAllRecords() {
        return medicalRecordRepository.findAll();
    }

    public Optional<MedicalRecord> getRecordById(Integer id) {
        return medicalRecordRepository.findById(id);
    }

    public List<MedicalRecord> getRecordsByMemberId(Integer memberId) {
        return medicalRecordRepository.findByMemberMemberID(memberId);
    }

    // Trả về chỉ danh sách link file PDF
    public List<String> getFileLinksByMemberId(Integer memberId) {
        return medicalRecordRepository.findFileLinksByMemberId(memberId);
    }

    public MedicalRecord createRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public MedicalRecord updateRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public void deleteRecord(Integer id) {
        medicalRecordRepository.deleteById(id);
    }

}
