package com.example.famMedical.service;

import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.exception.UserAlreadyExistsException;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserID(1);
        user.setEmail("test@example.com");
        user.setFullName("Test User");
        user.setPasswordHash("encodedPassword");
        user.setRole(UserRole.ChuHo);
    }

    @Test
    void authenticateUser_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);

        Optional<User> result = authService.authenticateUser("test@example.com", "password123");

        assertTrue(result.isPresent());
        assertEquals("test@example.com", result.get().getEmail());
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void authenticateUser_Failure_WrongPassword() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);

        Optional<User> result = authService.authenticateUser("test@example.com", "wrongpassword");

        assertFalse(result.isPresent());
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void registerFamily_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(familyRepository.save(any(Family.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User newUser = authService.registerFamily("New User", "new@example.com", "password123", "New Family", "123456789", "123 Street", "123456789012");

        assertNotNull(newUser);
        assertEquals("new@example.com", newUser.getEmail());
        assertEquals(UserRole.ChuHo, newUser.getRole());
        verify(userRepository).save(any(User.class));
        verify(familyRepository).save(any(Family.class));
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    void registerFamily_UserAlreadyExists() {
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> {
            authService.registerFamily("Existing User", "existing@example.com", "password123", "Existing Family", "123456789", "123 Street", "123456789012");
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerDoctor_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByDoctorCode(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("docEncodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setUserID(2); // Simulate saving and getting an ID
            return savedUser;
        });

        User newDoctor = authService.registerDoctor("Dr. Test", "doctor@example.com", "password123", "DOC123", "987654321", "456 Avenue", "098765432109", "General Hospital", "5");

        assertNotNull(newDoctor);
        assertEquals("doctor@example.com", newDoctor.getEmail());
        assertEquals(UserRole.BacSi, newDoctor.getRole());
        assertEquals("DOC123", newDoctor.getDoctorCode());
        verify(userRepository).save(any(User.class));
    }
}
