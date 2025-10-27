package com.example.famMedical.repository;

import com.example.famMedical.Entity.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FamilyRepository extends JpaRepository<Family, Integer> {

}