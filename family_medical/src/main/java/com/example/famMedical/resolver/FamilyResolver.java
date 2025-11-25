package com.example.famMedical.resolver;


import com.example.famMedical.Entity.Family;
import com.example.famMedical.service.FamilyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import java.util.List;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class FamilyResolver {

    private final FamilyService familyService;

    // Các GraphQL mappings đã được chuyển sang AdminGraphQLResolver để tránh xung đột
    // Các method này có thể được sử dụng bởi REST API hoặc các service khác
    
    public List<Family> getAllFamilies() {
        return familyService.getAllFamilies();
    }

    public Optional<Family> getFamilyById(Integer familyID) {
        return familyService.getFamilyById(familyID);
    }

    @QueryMapping
    public Family getFamilyByHeadOfFamilyID(@Argument Integer userID){
        // System.out.println("head:"+userID);
        return familyService.getFamilyByHeadOfFamilyID(userID);
    }

    public Family createFamily(Family family) {
        return familyService.createFamily(family);
    }

    public Family updateFamily(Family family) {
        return familyService.updateFamily(family);
    }

    public Boolean deleteFamily(Integer familyID) {
        familyService.deleteFamily(familyID);
        return true;
    }

    // Field resolver for memberCount
    @SchemaMapping(typeName = "Family", field = "memberCount")
    public Integer memberCount(Family family) {
        if (family.getMembers() != null) {
            return family.getMembers().size();
        }
        return 0;
    }
}

