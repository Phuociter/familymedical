package com.example.famMedical.resolver;

import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.service.MedicalRecordService;
import com.example.famMedical.dto.CreateMedicalRecordInput;
import com.example.famMedical.dto.UpdateMedicalRecordInput;
import com.example.famMedical.repository.MemberRepository;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@AllArgsConstructor
public class MedicalRecordResolver {
    private final MedicalRecordService medicalRecordService;
    private final MemberRepository memberRepository;

    @QueryMapping
    public List<MedicalRecord> getMedicalRecordsByMember(@Argument Integer memberID){
        return medicalRecordService.getRecordsByMemberId(memberID);
    }

    @MutationMapping
    public MedicalRecord createMedicalRecord(@Argument @Valid CreateMedicalRecordInput input) {
        MedicalRecord medicalRecord = new MedicalRecord();

        Member member = memberRepository.findById(input.getMemberID())
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + input.getMemberID()));

        // Convert fileType from String to Enum
        String fileTypeString = input.getFileType();
        if (fileTypeString != null && !fileTypeString.trim().isEmpty()) {
            try {
                MedicalRecord.FileType fileTypeEnum = MedicalRecord.FileType.valueOf(fileTypeString);
                medicalRecord.setFileType(fileTypeEnum);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid file type: " + fileTypeString);
            }
        }

        medicalRecord.setDescription(input.getDescription());
        medicalRecord.setFileLink(input.getFileLink());
        medicalRecord.setMember(member);

        return medicalRecordService.createMedicalRecord(medicalRecord);
    }

    @MutationMapping
    public Boolean deleteRecord(@Argument Integer recordID) {
        return medicalRecordService.deleteMedicalRecord(recordID);
    }
}
