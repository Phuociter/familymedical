package com.example.famMedical.resolver;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.service.MedicalRecordService;
import com.example.famMedical.dto.CreateMedicalRecordInput;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.repository.UserRepository;
import com.example.famMedical.repository.MemberRepository;

import jakarta.validation.Valid;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
public class MedicalRecordResolver {
    private final MedicalRecordService medicalRecordService;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    
    public MedicalRecordResolver(MedicalRecordService medicalRecordService, MemberRepository memberRepository, UserRepository userRepository){
        this.medicalRecordService = medicalRecordService;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;

    }

    @MutationMapping
    public MedicalRecord createMedicalRecord(@Argument @Valid Integer memberID,@Argument CreateMedicalRecordInput input){
        MedicalRecord medicalRecord = new MedicalRecord();

        Member member = memberRepository.findById(input.getMemberID())
        .orElseThrow(() -> new IllegalArgumentException("Member not found: " + input.getMemberID()));

        medicalRecord.setDescription(input.getDescription());
        medicalRecord.setRecordDate(input.getRecordDate());
        medicalRecord.setFileLink(input.getFileLink());
        medicalRecord.setFileLink(input.getFileLink());
        medicalRecord.setMember(member);

;
        return medicalRecordService.createMedicalRecord(medicalRecord);
    }
}
