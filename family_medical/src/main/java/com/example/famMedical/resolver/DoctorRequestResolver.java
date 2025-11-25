package com.example.famMedical.resolver;

import com.example.famMedical.service.DoctorRequestService;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.User;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
@AllArgsConstructor
@Slf4j
public class DoctorRequestResolver {
    private final DoctorRequestService doctorRequestService;


    @MutationMapping
    public DoctorRequest createDRequest(@Argument @Valid String doctorID, @Argument @Valid String userID) {
        // DRequest.
        return doctorRequestService.createDoctorRequest(doctorID,userID);
    }

    @MutationMapping
    @PreAuthorize("hasAuthority('BacSi')")
    public DoctorRequest respondToDoctorRequest(
            @AuthenticationPrincipal User doctorUser,
            @Argument Integer requestId,
            @Argument DoctorRequest.RequestStatus status,
            @Argument String message) {

        // Integer reqID = Integer.parseInt(requestID);
        log.info("Doctor {} responding to request {}, status: {}, response message: {}", doctorUser.getUserID(), requestId, status, message);
        
        return doctorRequestService.respondToRequest(requestId, doctorUser.getUserID(), status, message);
        
    }
}
