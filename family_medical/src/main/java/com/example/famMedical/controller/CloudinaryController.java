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

    /**
     * Get signed download URL for a medical record
     * @param user Authenticated user
     * @param recordID Medical record ID (not Cloudinary publicId)
     * @return Signed download URL that expires in 1 hour
     */
    @QueryMapping
    public String getMedicalRecordDownloadUrl(
        @AuthenticationPrincipal User user,
        Integer recordID
    ) {
        log.info("Generating download URL for user: {}, recordID: {}", user.getUserID(), recordID);
        
        // Delegate to service for permission check and URL generation
        return medicalRecordService.getDownloadUrl(user, recordID);
    }
}
