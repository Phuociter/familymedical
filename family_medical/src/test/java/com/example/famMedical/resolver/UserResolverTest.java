package com.example.famMedical.resolver;

import com.example.famMedical.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

class UserResolverTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserResolver userResolver;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void forgotPassword_Success() {
        // Arrange
        String email = "test@example.com";
        String expectedResponse = "Reset code sent to your email.";
        when(userService.forgotPassword(email)).thenReturn(expectedResponse);

        // Act
        String response = userResolver.forgotPassword(email);

        // Assert
        assertEquals(expectedResponse, response);
        verify(userService, times(1)).forgotPassword(email);
    }

    @Test
    void validateResetCode_Success() {
        // Arrange
        String email = "test@example.com";
        String code = "123456";
        String expectedResponse = "{\"token\":\"reset-token\"}";
        when(userService.validateResetCode(email, code)).thenReturn(expectedResponse);

        // Act
        String response = userResolver.validateResetCode(email, code);

        // Assert
        assertEquals(expectedResponse, response);
        verify(userService, times(1)).validateResetCode(email, code);
    }
    
    @Test
    void validateResetCode_Failure() {
        // Arrange
        String email = "test@example.com";
        String code = "wrong-code";
        String expectedResponse = "Invalid or expired code";
        when(userService.validateResetCode(email, code)).thenReturn(expectedResponse);

        // Act
        String response = userResolver.validateResetCode(email, code);

        // Assert
        assertEquals(expectedResponse, response);
        verify(userService, times(1)).validateResetCode(email, code);
    }

    @Test
    void resetMyPassword_Success() {
        // Arrange
        String token = "reset-token";
        String newPassword = "newStrongPassword";
        String expectedResponse = "Password has been reset successfully.";
        when(userService.resetMyPassword(token, newPassword)).thenReturn(expectedResponse);

        // Act
        String response = userResolver.resetMyPassword(token, newPassword);

        // Assert
        assertEquals(expectedResponse, response);
        verify(userService, times(1)).resetMyPassword(token, newPassword);
    }
    
    @Test
    void resetMyPassword_Failure_InvalidToken() {
        // Arrange
        String token = "invalid-token";
        String newPassword = "newStrongPassword";
        String expectedResponse = "Invalid or expired token.";
        when(userService.resetMyPassword(token, newPassword)).thenReturn(expectedResponse);

        // Act
        String response = userResolver.resetMyPassword(token, newPassword);

        // Assert
        assertEquals(expectedResponse, response);
        verify(userService, times(1)).resetMyPassword(token, newPassword);
    }
}
