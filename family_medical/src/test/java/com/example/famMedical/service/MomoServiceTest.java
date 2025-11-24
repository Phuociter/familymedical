package com.example.famMedical.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MomoServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Spy // Use @Spy for ObjectMapper since it's a concrete class with no interface
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private MomoService momoService;

    // Use these for setting @Value fields via reflection
    private String partnerCode = "MOMO";
    private String accessKey = "ACCESS_KEY";
    private String secretKey = "SECRET_KEY";
    private String endpoint = "http://localhost:8080/momo/api";
    private String returnUrl = "http://localhost:3000/return";
    private String ipnUrl = "http://localhost:3000/ipn";


    @BeforeEach
    void setUp() {
        // Inject values into the @Value fields using ReflectionTestUtils
        ReflectionTestUtils.setField(momoService, "partnerCode", partnerCode);
        ReflectionTestUtils.setField(momoService, "accessKey", accessKey);
        ReflectionTestUtils.setField(momoService, "secretKey", secretKey);
        ReflectionTestUtils.setField(momoService, "endpoint", endpoint);
        ReflectionTestUtils.setField(momoService, "returnUrl", returnUrl);
        ReflectionTestUtils.setField(momoService, "ipnUrl", ipnUrl);
    }

    @Test
    void createPayment_Success() throws Exception {
        String orderId = UUID.randomUUID().toString();
        long amount = 100000;
        String orderInfo = "Test Payment";
        String userId = "user123";

        Map<String, Object> mockMomoResponse = new HashMap<>();
        mockMomoResponse.put("payUrl", "http://momo.vn/pay/123");
        mockMomoResponse.put("qrCode", "base64qrimage");
        mockMomoResponse.put("errorCode", 0);
        mockMomoResponse.put("message", "Success");

        // Mock RestTemplate.postForObject
        when(restTemplate.postForObject(eq(endpoint), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(mockMomoResponse);

        // Spy on HmacSHA256 to ensure it's called, but let the real method execute
        // Alternatively, we could mock it: doReturn("mockedSignature").when(momoService).HmacSHA256(anyString(), anyString());
        // For simplicity, we assume the internal hashing works as expected and focus on the external call.

        Map<String, Object> result = momoService.createPayment(orderId, amount, orderInfo, userId);

        assertNotNull(result);
        assertEquals(mockMomoResponse, result);
        assertEquals(0, result.get("errorCode"));
        assertEquals("Success", result.get("message"));

        // Verify that RestTemplate.postForObject was called with specific arguments
        verify(restTemplate).postForObject(eq(endpoint), any(HttpEntity.class), eq(Map.class));

        // Optionally, if we want to verify the content of the HttpEntity argument:
        // We need to capture the argument passed to postForObject
        // ArgumentCaptor<HttpEntity> argumentCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        // verify(restTemplate).postForObject(eq(endpoint), argumentCaptor.capture(), eq(Map.class));
        // HttpEntity<Map<String, Object>> capturedEntity = argumentCaptor.getValue();
        // Map<String, Object> requestBody = capturedEntity.getBody();

        // Perform assertions on requestBody content, including signature verification if desired.
        // For a simple test, just verifying the call is sufficient.
    }

    @Test
    void createPayment_ThrowsRuntimeExceptionOnError() {
        String orderId = UUID.randomUUID().toString();
        long amount = 100000;
        String orderInfo = "Test Payment";
        String userId = "user123";

        when(restTemplate.postForObject(eq(endpoint), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new RuntimeException("Momo API error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            momoService.createPayment(orderId, amount, orderInfo, userId);
        });

        assertTrue(exception.getMessage().contains("Error creating MoMo payment"));
        verify(restTemplate).postForObject(eq(endpoint), any(HttpEntity.class), eq(Map.class));
    }
}
