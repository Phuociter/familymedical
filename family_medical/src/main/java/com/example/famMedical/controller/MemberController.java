package com.example.famMedical.controller;

import com.example.famMedical.Entity.Member;
import com.example.famMedical.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @QueryMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    @QueryMapping
    public Optional<Member> getMemberById(Integer memberID) {
        return memberService.getMemberById(memberID);
    }

    @QueryMapping
    public List<Member> getMembersByFamilyId(Integer familyID) {
        return memberService.getMembersByFamilyId(familyID);
    }

    @MutationMapping
    public Member createMember(Member member) {
        return memberService.createMember(member);
    }

    @MutationMapping
    public Member updateMember(Member member) {
        return memberService.updateMember(member);
    }

    @MutationMapping
    public Boolean deleteMember(Integer memberID) {
        memberService.deleteMember(memberID);
        return true;
    }
}

