package com.example.famMedical.resolver;


import com.example.famMedical.service.DoctorRequestService;

import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.dto.DoctorRequestInput;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;

import java.util.List;
import java.util.Optional;
import org.springframework.graphql.data.method.annotation.MutationMapping;

@Controller
public class DoctorRequestResolver {
    private final DoctorRequestService doctorRequestService;

    public DoctorRequestResolver(DoctorRequestService doctorRequestService) {
        this.doctorRequestService = doctorRequestService;
    }

    @MutationMapping
    public DoctorRequest createDRequest(@Argument @Valid String doctorID, @Argument @Valid String userID) {
        // DRequest.
        return doctorRequestService.createDoctorRequest(doctorID,userID);
    }
    
        // Map familyID từ entity Family → GraphQL Int
    @SchemaMapping(typeName = "DoctorRequest", field = "familyID")
    public Integer getFamilyID(DoctorRequest dr) {
        return dr.getFamily() != null ? dr.getFamily().getFamilyID() : null;
    }

    // Map doctorID từ entity User → GraphQL Int
    @SchemaMapping(typeName = "DoctorRequest", field = "doctorID")
    public Integer getDoctorID(DoctorRequest dr) {
        //code mới nhất
        return dr.getDoctor() != null ? dr.getDoctor().getUserID() : null;
        
    }
}
