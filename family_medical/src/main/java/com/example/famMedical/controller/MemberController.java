package com.example.famMedical.controller;

import com.example.famMedical.Entity.Member;
import com.example.famMedical.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // Các GraphQL mappings đã được chuyển sang AdminGraphQLResolver để tránh xung đột
    // Các method này có thể được sử dụng bởi REST API hoặc các service khác
    
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    public Optional<Member> getMemberById(Integer memberID) {
        return memberService.getMemberById(memberID);
    }

    public List<Member> getMembersByFamilyId(Integer familyID) {
        return memberService.getMembersByFamilyId(familyID);
    }

    public Member createMember(Member member) {
        return memberService.createMember(member);
    }

    public Member updateMember(Member member) {
        return memberService.updateMember(member);
    }

    public Boolean deleteMember(Integer memberID) {
        memberService.deleteMember(memberID);
        return true;
    }
}

