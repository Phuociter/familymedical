package com.example.famMedical.service;


import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final FamilyRepository familyRepository;
    private final FamilyService familyService;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Optional<Member> getMemberById(Integer id) {
        return memberRepository.findById(id);
    }

    public List<Member> getMembersByFamilyId(Integer familyID) {
        return memberRepository.findByFamily_FamilyID(familyID);
    }

    public Member createMember(Member member) {
        return memberRepository.save(member);
    }

    public Member updateMember(Member member) {
        return memberRepository.save(member);
    }

    public void deleteMember(Integer id) {
        memberRepository.deleteById(id);
    }

    // New methods for Phase 4
    public List<Member> getFamilyMembers(Integer familyId, Integer doctorId) {
        // Validate access
        familyService.validateDoctorFamilyAccess(doctorId, familyId);
        
        Family family = familyRepository.findById(familyId)
            .orElseThrow(() -> new NotFoundException("Family not found"));
            
        return memberRepository.findByFamily_FamilyID(familyId);
    }
    
    public Member getMemberDetail(Integer memberId, Integer doctorId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new NotFoundException("Member not found"));
            
        // Validate doctor has access to member's family
        familyService.validateDoctorFamilyAccess(doctorId, member.getFamily().getFamilyID());
        
        return member;
    }
}
