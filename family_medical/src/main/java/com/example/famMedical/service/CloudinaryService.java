package com.example.famMedical.service;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.http44.ApiUtils;
import com.example.famMedical.dto.SignatureResponse;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
public class CloudinaryService {
    private Cloudinary cloudinary;
    
    public SignatureResponse generateSignature(Map<String, Object> paramsToSign) {
        long timestamp = Instant.now().getEpochSecond();

        Map<String, Object> params = new HashMap<>(paramsToSign);
        params.put("timestamp", timestamp);

        try {
            String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);
            
            return new SignatureResponse(signature, timestamp, getApiKey(), getCloudName());

        } catch (Exception e) {
            log.error("Lỗi khi tạo chữ ký Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo chữ ký Cloudinary", e);
        }
    }

    /**
     * Generate a signed download URL for a Cloudinary resource
     * @param publicId The Cloudinary public ID (e.g., "user123/medical_record.pdf")
     * @param expirationSeconds URL expiration time in seconds (default: 1 hour)
     * @return Signed URL that expires after the specified time
     */
    public String getSignedDownloadUrl(String publicId, int expirationSeconds) {
        try {
            long expiresAt = Instant.now().getEpochSecond() + expirationSeconds;
            
            String signedUrl = cloudinary.url()
                .resourceType("auto")
                .type("authenticated")
                .signed(true)
                .generate(publicId);
                
            log.info("Generated signed URL for publicId: {}, expires at: {}", publicId, expiresAt);
            return signedUrl;
        } catch (Exception e) {
            log.error("Error generating signed download URL from Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Cannot generate signed download URL from Cloudinary", e);
        }
    }
    
    /**
     * Generate a signed download URL with default 1-hour expiration
     */
    public String getSignedDownloadUrl(String publicId) {
        return getSignedDownloadUrl(publicId, 3600); // 1 hour default
    }

    private String getCloudName() {
        return cloudinary.config.cloudName;
    }

    private String getApiKey() {
        return cloudinary.config.apiKey;
    }
}

