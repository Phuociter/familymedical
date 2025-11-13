package com.example.famMedical.service;


import com.example.famMedical.Entity.Family;
import com.example.famMedical.repository.FamilyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FamilyService {

    private final FamilyRepository familyRepository;

    public List<Family> getAllFamilies() {
        return familyRepository.findAll();
    }

    public Optional<Family> getFamilyById(Integer id) {
        return familyRepository.findById(id);
    }

    public Family createFamily(Family family) {
        return familyRepository.save(family);
    }

    public Family updateFamily(Family family) {
        return familyRepository.save(family);
    }

    public void deleteFamily(Integer id) {
        familyRepository.deleteById(id);
    }
}
