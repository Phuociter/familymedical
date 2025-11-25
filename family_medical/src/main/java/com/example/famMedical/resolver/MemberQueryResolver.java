package com.example.famMedical.resolver;

import com.example.famMedical.Entity.Appointment;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.repository.AppointmentRepository;
import com.example.famMedical.repository.MedicalRecordRepository;
import com.example.famMedical.service.MemberService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

@Controller
public class MemberQueryResolver {
    private final MemberService memberService;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
   
    public MemberQueryResolver(MemberService memberService, 
                              MedicalRecordRepository medicalRecordRepository,
                              AppointmentRepository appointmentRepository) {
        this.memberService = memberService;
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @QueryMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    @QueryMapping 
    public List<Member> membersByFamilyID(@Argument Integer familyID){
        return memberService.getMembersByFamilyId(familyID);
    }

    @QueryMapping
    public Optional<Member> getMemberById(Integer memberID) {
        return memberService.getMemberById(memberID);
    }

    // Các mutation createMember, updateMember, deleteMember đã được xử lý bởi AdminGraphQLResolver
    // với đúng signature theo GraphQL schema (sử dụng CreateMemberInput và UpdateMemberInput)

    // Field resolver for age
    @SchemaMapping(typeName = "Member", field = "age")
    public Integer age(Member member) {
        if (member.getDateOfBirth() != null) {
            return Period.between(member.getDateOfBirth(), LocalDate.now()).getYears();
        }
        return null;
    }

    // Field resolver for medicalRecords
    @SchemaMapping(typeName = "Member", field = "medicalRecords")
    public List<MedicalRecord> medicalRecords(Member member) {
        return medicalRecordRepository.findByMember_MemberID(member.getMemberID());
    }

    // Field resolver for appointments
    @SchemaMapping(typeName = "Member", field = "appointments")
    public List<Appointment> appointments(Member member) {
        return appointmentRepository.findByMemberOrderByAppointmentDateTimeDesc(member);
    }
}
