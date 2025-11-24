package com.example.famMedical.controller;

import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.AuthPayload;
import com.example.famMedical.dto.CompleteProfileRequest;
import com.example.famMedical.dto.DoctorRegisterInput;
import com.example.famMedical.dto.FamilyRegisterInput;
import com.example.famMedical.dto.LoginInput;
import com.example.famMedical.dto.UpdateUserInput;
import com.example.famMedical.exception.InvalidCredentialsException;
import com.example.famMedical.service.AuthService;
import com.example.famMedical.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

class AuthGraphQLResolverTest {

    @Mock
    private AuthService authService;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthGraphQLResolver authGraphQLResolver;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void login_Success() {
        // Arrange
        LoginInput loginInput = new LoginInput();
        loginInput.setEmail("test@example.com");
        loginInput.setPassword("password");
        User user = new User();
        user.setEmail("test@example.com");
        AuthPayload expectedPayload = new AuthPayload("test-token", user);

        when(authService.authenticateUser("test@example.com", "password")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("test-token");

        // Act
        AuthPayload actualPayload = authGraphQLResolver.login(loginInput);

        // Assert
        assertNotNull(actualPayload);
        assertEquals(expectedPayload.getToken(), actualPayload.getToken());
        assertEquals(expectedPayload.getUser().getEmail(), actualPayload.getUser().getEmail());
        verify(authService, times(1)).authenticateUser("test@example.com", "password");
        verify(jwtService, times(1)).generateToken(user);
    }

    @Test
    void login_Failure_InvalidCredentials() {
        // Arrange
        LoginInput loginInput = new LoginInput();
        loginInput.setEmail("wrong@example.com");
        loginInput.setPassword("wrongpassword");
        when(authService.authenticateUser(anyString(), anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidCredentialsException.class, () -> authGraphQLResolver.login(loginInput));
        verify(authService, times(1)).authenticateUser("wrong@example.com", "wrongpassword");
        verify(jwtService, times(0)).generateToken(any());
    }

    @Test
    void registerFamily_Success() {
        // Arrange
        FamilyRegisterInput input = new FamilyRegisterInput();
        input.setFullName("Test Family");
        input.setEmail("family@example.com");
        input.setPassword("password");
        input.setFamilyName("FamilyName");
        input.setPhoneNumber("0123456789");
        input.setAddress("Address");
        input.setCccd("123456789012");
        User user = new User();
        user.setEmail("family@example.com");

        when(authService.registerFamily(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString())).thenReturn(user);

        // Act
        User result = authGraphQLResolver.registerFamily(input);

        // Assert
        assertNotNull(result);
        assertEquals("family@example.com", result.getEmail());
        verify(authService, times(1)).registerFamily(input.getFullName(), input.getEmail(), input.getPassword(), input.getFamilyName(), input.getPhoneNumber(), input.getAddress(), input.getCccd());
    }

    @Test
    void registerDoctor_Success() {
        // Arrange
        DoctorRegisterInput input = new DoctorRegisterInput();
        input.setFullName("Test Doctor");
        input.setEmail("doctor@example.com");
        input.setPassword("password");
        input.setDoctorCode("DOC123");
        input.setPhoneNumber("0987654321");
        input.setAddress("Hospital Address");
        input.setCccd("120987654321");
        input.setHospitalName("Test Hospital");
        input.setYearsOfExperience("5"); // Corrected to String
        User user = new User();
        user.setEmail("doctor@example.com");

        when(authService.registerDoctor(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString())).thenReturn(user);

        // Act
        User result = authGraphQLResolver.registerDoctor(input);

        // Assert
        assertNotNull(result);
        assertEquals("doctor@example.com", result.getEmail());
        verify(authService, times(1)).registerDoctor(input.getFullName(), input.getEmail(), input.getPassword(), input.getDoctorCode(), input.getPhoneNumber(), input.getAddress(), input.getCccd(), input.getHospitalName(), input.getYearsOfExperience());
    }

    private void mockSecurityContext(String email) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, null);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void completeOAuth2Profile_Success() {
        // Arrange
        String userEmail = "oauthuser@example.com";
        mockSecurityContext(userEmail);

        CompleteProfileRequest input = new CompleteProfileRequest("OAuthFamily", "111222333", "OAuth Address");
        User user = new User();
        user.setUserID(1);
        user.setEmail(userEmail);
        
        User updatedUser = new User();
        updatedUser.setEmail(userEmail);

        when(authService.findUserByEmail(userEmail)).thenReturn(Optional.of(user));
        when(authService.completeOAuth2FamilyRegistration(user.getUserID(), input.getFamilyName(), input.getPhoneNumber(), input.getAddress())).thenReturn(updatedUser);

        // Act
        User result = authGraphQLResolver.completeOAuth2Profile(input);

        // Assert
        assertNotNull(result);
        assertEquals(userEmail, result.getEmail());
        verify(authService, times(1)).findUserByEmail(userEmail);
        verify(authService, times(1)).completeOAuth2FamilyRegistration(user.getUserID(), input.getFamilyName(), input.getPhoneNumber(), input.getAddress());
    }
    
    @Test
    void updateUserProfile_Success() {
        // Arrange
        String userEmail = "testuser@example.com";
        mockSecurityContext(userEmail);

        UpdateUserInput input = new UpdateUserInput();
        input.setFullName("Updated Name");
        input.setPhoneNumber("0123456789");
        input.setCccd("new_cccd");
        input.setAvatarUrl("http://avatar.url/new");
        input.setAddress("New Address");
        User currentUser = new User();
        currentUser.setUserID(1);
        currentUser.setEmail(userEmail);

        User updatedUser = new User();
        updatedUser.setFullName("Updated Name");

        when(authService.findUserByEmail(userEmail)).thenReturn(Optional.of(currentUser));
        when(authService.updateUserProfile(currentUser.getUserID(), input.getFullName(), input.getPhoneNumber(), input.getCccd(), input.getAvatarUrl(), input.getAddress())).thenReturn(updatedUser);

        // Act
        User result = authGraphQLResolver.updateUserProfile(input);

        // Assert
        assertNotNull(result);

        assertEquals("Updated Name", result.getFullName());
        verify(authService, times(1)).findUserByEmail(userEmail);
        verify(authService, times(1)).updateUserProfile(currentUser.getUserID(), input.getFullName(), input.getPhoneNumber(), input.getCccd(), input.getAvatarUrl(), input.getAddress());
    }
}
