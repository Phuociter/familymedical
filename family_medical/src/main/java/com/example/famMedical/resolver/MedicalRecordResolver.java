package com.example.famMedical.resolver;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.service.MedicalRecordService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
public class MedicalRecordResolver {
    private final MedicalRecordService medicalRecordService;
    
    public MedicalRecordResolver(MedicalRecordService medicalRecordService){
        this.medicalRecordService = medicalRecordService;
    }

    // @MutationMapping
    // public 
}
