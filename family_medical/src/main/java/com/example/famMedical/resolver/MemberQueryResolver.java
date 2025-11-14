package com.example.famMedical.resolver;

import com.example.famMedical.Entity.Member;
import com.example.famMedical.service.MemberService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
    
import java.util.List;

@Controller
public class MemberQueryResolver {
    private final MemberService memberService;
   
    public MemberQueryResolver(MemberService memberService) {
        this.memberService = memberService;
    }

    @QueryMapping 
    public List<Member> membersByFamilyID(@Argument Integer familyID){
        return memberService.getMembersByFamilyId(familyID);
    }

    // Các mutation createMember, updateMember, deleteMember đã được xử lý bởi AdminGraphQLResolver
    // với đúng signature theo GraphQL schema (sử dụng CreateMemberInput và UpdateMemberInput)
}
