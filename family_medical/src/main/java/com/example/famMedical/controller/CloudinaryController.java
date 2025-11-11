package com.example.famMedical.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.SignatureResponse;
import com.example.famMedical.service.CloudinaryService;
import com.example.famMedical.service.MedicalRecordService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
@AllArgsConstructor
public class CloudinaryController {
    private CloudinaryService cloudinaryService;
    private MedicalRecordService medicalRecordService;

    @QueryMapping
    public SignatureResponse generateSignature(
        @AuthenticationPrincipal User user
    ) {
        log.info("Generating Cloudinary signature for user: {}", user.getUserID());
        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("folder", user.getUserID() + "/");

        return cloudinaryService.generateSignature(paramsToSign);
    }

    @QueryMapping
    public String getDownloadUrl(
        @AuthenticationPrincipal User user,
        String publicId
    ) {
        log.info("Generating download URL for user: {}, publicId: {}", user.getUserID(), publicId);
        int recordId;
        try {
            recordId = Integer.parseInt(publicId);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid publicId");
        }

        // Delegate to service for permission check and URL generation
        return medicalRecordService.getDownloadUrl(user, recordId);
    }
}
