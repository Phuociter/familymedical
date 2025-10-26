package com.example.famMedical.controller;

import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.AuthPayload;
import com.example.famMedical.dto.CompleteProfileRequest;
import com.example.famMedical.dto.DoctorRegisterInput;
import com.example.famMedical.dto.FamilyRegisterInput;
import com.example.famMedical.dto.LoginInput;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.famMedical.exception.InvalidCredentialsException;
import com.example.famMedical.service.AuthService;
import com.example.famMedical.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AuthGraphQLResolver {

    private final AuthService authService;
    private final JwtService jwtService;


    public AuthGraphQLResolver(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @MutationMapping
    public AuthPayload login(@Argument @Valid LoginInput input) {
        User user = authService.authenticateUser(input.getEmail(), input.getPassword())
                .orElseThrow(InvalidCredentialsException::new);


        String token = jwtService.generateToken(user);

        return new AuthPayload(token, user);
    }

    @MutationMapping
    public User registerFamily(@Argument @Valid FamilyRegisterInput input) {


        return authService.registerFamily(
                input.getFullName(),
                input.getEmail(),
                input.getPassword(),
                input.getFamilyName(),
                input.getPhoneNumber(),
                input.getAddress(),
                input.getCccd()
        );
    }

    @MutationMapping
    public User registerDoctor(@Argument @Valid DoctorRegisterInput input) {
        return authService.registerDoctor(
                input.getFullName(),
                input.getEmail(),
                input.getPassword(),
                input.getDoctorCode(),
                input.getPhoneNumber(),
                input.getAddress(),
                input.getCccd()
        );
    }

    @MutationMapping
    public User completeOAuth2Profile(@Argument @Valid CompleteProfileRequest input) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.findUserByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found."));

        return authService.completeOAuth2FamilyRegistration(
                user.getUserID(),
                input.getFamilyName(),
                input.getPhoneNumber(),
                input.getAddress()
        );
    }
}
