package com.example.famMedical.resolver;

import com.example.famMedical.service.DoctorRequestService;
import com.example.famMedical.Entity.DoctorRequest;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

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
    
    // Các schema mapping cho familyID và doctorID đã được xử lý bởi AdminGraphQLResolver
    // để tránh conflict mapping
}
