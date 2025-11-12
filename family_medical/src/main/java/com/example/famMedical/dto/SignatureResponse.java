package com.example.famMedical.dto;

public record SignatureResponse(
    String signature,
    long timestamp,
    String apiKey,
    String cloudName
) {}
