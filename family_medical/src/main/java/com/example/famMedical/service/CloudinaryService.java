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

    public String getDownloadUrl(String publicId) {
        try {
            String downloadUrl = cloudinary.url()
                .resourceType("auto")
                .type("authenticated")
                .generate(publicId);
            return downloadUrl;
        } catch (Exception e) {
            log.error("Lỗi khi tạo URL tải xuống từ Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo URL tải xuống từ Cloudinary", e);
        }
    }

    private String getCloudName() {
        return cloudinary.config.cloudName;
    }

    private String getApiKey() {
        return cloudinary.config.apiKey;
    }
}

