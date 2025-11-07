package com.example.famMedical.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MomoService {

    @Value("${momo.partnerCode}")
    private String partnerCode;
    @Value("${momo.accessKey}")
    private String accessKey;
    @Value("${momo.secretKey}")
    private String secretKey;
    @Value("${momo.endpoint}")
    private String endpoint;
    @Value("${momo.returnUrl}")
    private String returnUrl;
    @Value("${momo.ipnUrl}") // New
    private String ipnUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MomoService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> createPayment(String orderId, long amount, String orderInfo, String userId) {
        try {
            String requestId = UUID.randomUUID().toString();
            String extraData = "{}";


            String rawSignature = "accessKey=" + accessKey +
                                  "&amount=" + amount +
                                  "&extraData=" + extraData +
                                  "&ipnUrl=" + ipnUrl + // New
                                  "&orderId=" + orderId +
                                  "&orderInfo=" + orderInfo +
                                  "&partnerCode=" + partnerCode +
                                  "&redirectUrl=" + returnUrl +
                                  "&requestId=" + requestId +
                                  "&requestType=captureWallet";

            String signature = HmacSHA256(rawSignature, secretKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("partnerName", "Test");
            requestBody.put("storeId", "MomoTestStore");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", returnUrl);
            requestBody.put("ipnUrl", ipnUrl); // New
            requestBody.put("lang", "vi"); // From reference
            requestBody.put("requestType", "captureWallet");
            requestBody.put("extraData", extraData);
            requestBody.put("signature", signature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            Map<String, Object> response = restTemplate.postForObject(endpoint, entity, Map.class);
            return response;

        } catch (Exception e) {
            e.printStackTrace();

            throw new RuntimeException("Error creating MoMo payment: " + e.getMessage());
        }
    }

    public String HmacSHA256(String data, String key) throws NoSuchAlgorithmException {
        try {
            javax.crypto.Mac sha256_HMAC = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secret_key = new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new NoSuchAlgorithmException("Error hashing data: " + e.getMessage(), e);
        }
    }
}
