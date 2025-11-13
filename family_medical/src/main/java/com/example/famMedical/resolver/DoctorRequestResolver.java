package com.example.famMedical.resolver;


import com.example.famMedical.service.DoctorRequestService;

import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.dto.DoctorRequestInput;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
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
    public DoctorRequest createDRequest(@Argument @Valid DoctorRequestInput input) {
        // DRequest.
        return doctorRequestService.createDoctorRequest(input.getDoctorID(),input.getUserID());
    }   
}
