package com.example.famMedical.resolver;

import com.example.famMedical.Entity.Member;
import com.example.famMedical.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
    
import java.util.List;
public class MemberQueryResolver {
    private final MemberService memberService;
   
    @Autowired
    public MemberQueryResolver(MemberService memberService) {
        this.memberService = memberService;
    }

    @QueryMapping 
    public List<Member> membersByFamilyID(@Argument Integer familyID){
        return memberService.getMembersByFamilyId(familyID);
    }

    @MutationMapping
    public void deleteMember(@Argument Integer memberID){
         memberService.deleteMember(memberID);
    }

    @MutationMapping
    public Member createMember(@Argument Member member){
        return memberService.createMember(member);
    }

    @MutationMapping
    public Member updateMember(@Argument Member member){
        return memberService.updateMember(member);
    }

}
