package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole; // Corrected import
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    // A base64 encoded secret key for testing (minimum 256 bits for HS256)
    private final String TEST_SECRET_KEY = "TestSecretKeyForFamMedicalApplicationTesting1234567890"; // 50 chars, for HS256 it should be 32 bytes == 44 chars in base64
    private final long TEST_EXPIRATION_TIME = 3600000; // 1 hour in milliseconds

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Inject values using ReflectionTestUtils since @Value won't work in a plain JUnit test
        ReflectionTestUtils.setField(jwtService, "SECRET_KEY", TEST_SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "EXPIRATION_TIME", TEST_EXPIRATION_TIME);

        testUser = new User();
        testUser.setUserID(1);
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.ChuHo);
    }

    @Test
    void generateToken_defaultExpiration_shouldReturnValidToken() {
        // Act
        String token = jwtService.generateToken(testUser);

        // Assert
        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        assertEquals(testUser.getEmail(), jwtService.extractUsername(token));
    }

    @Test
    void generateToken_customExpiration_shouldReturnValidToken() {
        // Arrange
        long customExpirationTime = 1000L; // 1 second for quick expiry

        // Act
        String token = jwtService.generateToken(testUser, customExpirationTime);

        // Assert
        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        assertEquals(testUser.getEmail(), jwtService.extractUsername(token));
    }

    @Test
    void validateToken_expiredToken_shouldReturnFalse() throws InterruptedException {
        // Arrange
        long shortExpirationTime = 100L; // 0.1 second
        String expiredToken = jwtService.generateToken(testUser, shortExpirationTime);

        // Wait for token to expire
        Thread.sleep(shortExpirationTime + 50); // wait a bit more than expiry time

        // Act
        boolean isValid = jwtService.validateToken(expiredToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateToken_invalidSignature_shouldReturnFalse() {
        // Arrange
        String malformedSecretKey = "AnotherSecretKeyForTestingInvalidSignatures1234567890";
        ReflectionTestUtils.setField(jwtService, "SECRET_KEY", malformedSecretKey); // Temporarily change secret

        String token = jwtService.generateToken(testUser); // Generate with malformed secret
        
        ReflectionTestUtils.setField(jwtService, "SECRET_KEY", TEST_SECRET_KEY); // Restore original secret

        // Act
        boolean isValid = jwtService.validateToken(token); // Validate with correct secret

        // Assert
        assertFalse(isValid);
    }
    
    @Test
    void extractUsername_shouldReturnCorrectEmail() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        String username = jwtService.extractUsername(token);

        // Assert
        assertEquals(testUser.getEmail(), username);
    }

    @Test
    void extractUsername_expiredToken_shouldThrowException() throws InterruptedException {
        // Arrange
        long shortExpirationTime = 100L; // 0.1 second
        String expiredToken = jwtService.generateToken(testUser, shortExpirationTime);
        Thread.sleep(shortExpirationTime + 50);

        // Act & Assert
        assertThrows(ExpiredJwtException.class, () -> jwtService.extractUsername(expiredToken));
    }
    
    @Test
    void extractUsername_invalidToken_shouldThrowException() {
        // Arrange
        String invalidToken = "invalid.jwt.token";

        // Act & Assert
        assertThrows(MalformedJwtException.class, () -> jwtService.extractUsername(invalidToken));
    }
}
