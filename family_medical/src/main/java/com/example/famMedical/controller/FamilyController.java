package com.example.famMedical.controller;


import com.example.famMedical.Entity.Family;
import com.example.famMedical.service.FamilyService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;

    @QueryMapping
    public List<Family> getAllFamilies() {
        return familyService.getAllFamilies();
    }

    @QueryMapping
    public Optional<Family> getFamilyById(Integer familyID) {
        return familyService.getFamilyById(familyID);
    }

    @MutationMapping
    public Family createFamily(Family family) {
        return familyService.createFamily(family);
    }

    @MutationMapping
    public Family updateFamily(Family family) {
        return familyService.updateFamily(family);
    }

    @MutationMapping
    public Boolean deleteFamily(Integer familyID) {
        familyService.deleteFamily(familyID);
        return true;
    }
}

