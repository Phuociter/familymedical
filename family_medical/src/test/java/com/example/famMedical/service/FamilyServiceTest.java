package com.example.famMedical.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("FamilyService Tests")
public class FamilyServiceTest {

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorAssignmentRepository doctorAssignmentRepository;

    @InjectMocks
    private FamilyService familyService;

    private Family family;
    private User headOfFamily;
    private User doctor;
    private User nonDoctor;

    @BeforeEach
    public void setUp() {
        // Setup head of family
        headOfFamily = new User();
        headOfFamily.setUserID(1);
        headOfFamily.setEmail("head@example.com");
        headOfFamily.setFullName("Head of Family");
        headOfFamily.setRole(UserRole.ChuHo);

        // Setup doctor
        doctor = new User();
        doctor.setUserID(2);
        doctor.setEmail("doctor@example.com");
        doctor.setFullName("Dr. John");
        doctor.setRole(UserRole.BacSi);

        // Setup non-doctor
        nonDoctor = new User();
        nonDoctor.setUserID(3);
        nonDoctor.setEmail("user@example.com");
        nonDoctor.setFullName("Regular User");
        nonDoctor.setRole(UserRole.ChuHo);

        // Setup family
        family = new Family();
        family.setFamilyID(100);
        family.setFamilyName("Test Family");
        family.setAddress("123 Test Street");
        family.setHeadOfFamily(headOfFamily);
    }

    @Nested
    @DisplayName("Basic CRUD Operations")
    class BasicCRUDTests {

        @Test
        @DisplayName("Should get all families")
        public void shouldGetAllFamilies() {
            // Arrange
            List<Family> expectedFamilies = Arrays.asList(family);
            when(familyRepository.findAll()).thenReturn(expectedFamilies);

            // Act
            List<Family> result = familyService.getAllFamilies();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedFamilies, result);
            verify(familyRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should get family by id - success")
        public void shouldGetFamilyById_Success() {
            // Arrange
            when(familyRepository.findById(100)).thenReturn(Optional.of(family));

            // Act
            Optional<Family> result = familyService.getFamilyById(100);

            // Assert
            assertTrue(result.isPresent());
            assertEquals(family.getFamilyID(), result.get().getFamilyID());
            assertEquals(family.getFamilyName(), result.get().getFamilyName());
            verify(familyRepository, times(1)).findById(100);
        }

        @Test
        @DisplayName("Should get family by id - not found")
        public void shouldGetFamilyById_NotFound() {
            // Arrange
            when(familyRepository.findById(999)).thenReturn(Optional.empty());

            // Act
            Optional<Family> result = familyService.getFamilyById(999);

            // Assert
            assertFalse(result.isPresent());
            verify(familyRepository, times(1)).findById(999);
        }

        @Test
        @DisplayName("Should get family by head of family ID")
        public void shouldGetFamilyByHeadOfFamilyID() {
            // Arrange
            when(familyRepository.findByHeadOfFamily_UserID(1)).thenReturn(family);

            // Act
            Family result = familyService.getFamilyByHeadOfFamilyID(1);

            // Assert
            assertNotNull(result);
            assertEquals(family.getFamilyID(), result.getFamilyID());
            assertEquals(family.getHeadOfFamily().getUserID(), result.getHeadOfFamily().getUserID());
            verify(familyRepository, times(1)).findByHeadOfFamily_UserID(1);
        }

        @Test
        @DisplayName("Should create family successfully")
        public void shouldCreateFamilySuccessfully() {
            // Arrange
            Family newFamily = new Family();
            newFamily.setFamilyName("New Family");
            newFamily.setAddress("New Address");
            newFamily.setHeadOfFamily(headOfFamily);

            when(familyRepository.save(any(Family.class))).thenReturn(newFamily);

            // Act
            Family result = familyService.createFamily(newFamily);

            // Assert
            assertNotNull(result);
            assertEquals("New Family", result.getFamilyName());
            verify(familyRepository, times(1)).save(newFamily);
        }

        @Test
        @DisplayName("Should update family successfully")
        public void shouldUpdateFamilySuccessfully() {
            // Arrange
            family.setFamilyName("Updated Family Name");
            family.setAddress("Updated Address");

            when(familyRepository.save(any(Family.class))).thenReturn(family);

            // Act
            Family result = familyService.updateFamily(family);

            // Assert
            assertNotNull(result);
            assertEquals("Updated Family Name", result.getFamilyName());
            assertEquals("Updated Address", result.getAddress());
            verify(familyRepository, times(1)).save(family);
        }

        @Test
        @DisplayName("Should delete family successfully")
        public void shouldDeleteFamilySuccessfully() {
            // Arrange
            doNothing().when(familyRepository).deleteById(100);

            // Act
            familyService.deleteFamily(100);

            // Assert
            verify(familyRepository, times(1)).deleteById(100);
        }
    }

    @Nested
    @DisplayName("Doctor Assignment Operations")
    class DoctorAssignmentTests {

        @Test
        @DisplayName("Should get assigned families for doctor - success")
        public void shouldGetAssignedFamilies_Success() {
            // Arrange
            List<Family> expectedFamilies = Arrays.asList(family);
            when(userRepository.findById(2)).thenReturn(Optional.of(doctor));
            when(familyRepository.findAssignedFamiliesByDoctorId(2)).thenReturn(expectedFamilies);

            // Act
            List<Family> result = familyService.getAssignedFamilies(2);

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedFamilies, result);
            verify(userRepository, times(1)).findById(2);
            verify(familyRepository, times(1)).findAssignedFamiliesByDoctorId(2);
        }

        @Test
        @DisplayName("Should throw exception when doctor not found")
        public void shouldThrowExceptionWhenDoctorNotFound() {
            // Arrange
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            NotFoundException exception = assertThrows(NotFoundException.class, () ->
                familyService.getAssignedFamilies(999)
            );

            assertTrue(exception.getMessage().contains("Doctor not found"));
            verify(userRepository, times(1)).findById(999);
            verify(familyRepository, never()).findAssignedFamiliesByDoctorId(anyInt());
        }

        @Test
        @DisplayName("Should throw exception when user is not a doctor")
        public void shouldThrowExceptionWhenUserNotDoctor() {
            // Arrange
            when(userRepository.findById(3)).thenReturn(Optional.of(nonDoctor));

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () ->
                familyService.getAssignedFamilies(3)
            );

            assertTrue(exception.getMessage().contains("User is not a doctor"));
            verify(userRepository, times(1)).findById(3);
            verify(familyRepository, never()).findAssignedFamiliesByDoctorId(anyInt());
        }

        @Test
        @DisplayName("Should get family detail - success")
        public void shouldGetFamilyDetail_Success() {
            // Arrange
            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(userRepository.findById(2)).thenReturn(Optional.of(doctor));
            when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                2, 100, AssignmentStatus.ACTIVE)).thenReturn(true);

            // Act
            Family result = familyService.getFamilyDetail(100, 2);

            // Assert
            assertNotNull(result);
            assertEquals(family.getFamilyID(), result.getFamilyID());
            verify(familyRepository, times(1)).findById(100);
            verify(userRepository, times(1)).findById(2);
            verify(doctorAssignmentRepository, times(1))
                .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(2, 100, AssignmentStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should throw exception when family not found in getFamilyDetail")
        public void shouldThrowExceptionWhenFamilyNotFoundInGetFamilyDetail() {
            // Arrange
            when(familyRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            NotFoundException exception = assertThrows(NotFoundException.class, () ->
                familyService.getFamilyDetail(999, 2)
            );

            assertTrue(exception.getMessage().contains("Family not found"));
            verify(familyRepository, times(1)).findById(999);
            verify(userRepository, never()).findById(anyInt());
        }

        @Test
        @DisplayName("Should throw exception when doctor not found in getFamilyDetail")
        public void shouldThrowExceptionWhenDoctorNotFoundInGetFamilyDetail() {
            // Arrange
            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            NotFoundException exception = assertThrows(NotFoundException.class, () ->
                familyService.getFamilyDetail(100, 999)
            );

            assertTrue(exception.getMessage().contains("Doctor not found"));
            verify(familyRepository, times(1)).findById(100);
            verify(userRepository, times(1)).findById(999);
        }

        @Test
        @DisplayName("Should throw exception when user is not a doctor in getFamilyDetail")
        public void shouldThrowExceptionWhenUserNotDoctorInGetFamilyDetail() {
            // Arrange
            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(userRepository.findById(3)).thenReturn(Optional.of(nonDoctor));

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () ->
                familyService.getFamilyDetail(100, 3)
            );

            assertTrue(exception.getMessage().contains("User is not a doctor"));
            verify(familyRepository, times(1)).findById(100);
            verify(userRepository, times(1)).findById(3);
        }

        @Test
        @DisplayName("Should throw exception when doctor has no access to family")
        public void shouldThrowExceptionWhenDoctorHasNoAccess() {
            // Arrange
            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(userRepository.findById(2)).thenReturn(Optional.of(doctor));
            when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                2, 100, AssignmentStatus.ACTIVE)).thenReturn(false);

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () ->
                familyService.getFamilyDetail(100, 2)
            );

            assertTrue(exception.getMessage().contains("Not authorized to access this family"));
            verify(familyRepository, times(1)).findById(100);
            verify(userRepository, times(1)).findById(2);
            verify(doctorAssignmentRepository, times(1))
                .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(2, 100, AssignmentStatus.ACTIVE);
        }
    }

    @Nested
    @DisplayName("Validation Operations")
    class ValidationTests {

        @Test
        @DisplayName("Should validate doctor family access - success")
        public void shouldValidateDoctorFamilyAccess_Success() {
            // Arrange
            when(userRepository.findById(2)).thenReturn(Optional.of(doctor));
            when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                2, 100, AssignmentStatus.ACTIVE)).thenReturn(true);

            // Act
            assertDoesNotThrow(() -> familyService.validateDoctorFamilyAccess(2, 100));

            // Assert
            verify(userRepository, times(1)).findById(2);
            verify(doctorAssignmentRepository, times(1))
                .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(2, 100, AssignmentStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should throw exception when doctor not found in validateDoctorFamilyAccess")
        public void shouldThrowExceptionWhenDoctorNotFoundInValidate() {
            // Arrange
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            NotFoundException exception = assertThrows(NotFoundException.class, () ->
                familyService.validateDoctorFamilyAccess(999, 100)
            );

            assertTrue(exception.getMessage().contains("Doctor not found"));
            verify(userRepository, times(1)).findById(999);
        }

        @Test
        @DisplayName("Should throw exception when user is not a doctor in validateDoctorFamilyAccess")
        public void shouldThrowExceptionWhenUserNotDoctorInValidate() {
            // Arrange
            when(userRepository.findById(3)).thenReturn(Optional.of(nonDoctor));

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () ->
                familyService.validateDoctorFamilyAccess(3, 100)
            );

            assertTrue(exception.getMessage().contains("User is not a doctor"));
            verify(userRepository, times(1)).findById(3);
        }

        @Test
        @DisplayName("Should throw exception when doctor has no access in validateDoctorFamilyAccess")
        public void shouldThrowExceptionWhenNoAccessInValidate() {
            // Arrange
            when(userRepository.findById(2)).thenReturn(Optional.of(doctor));
            when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                2, 100, AssignmentStatus.ACTIVE)).thenReturn(false);

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () ->
                familyService.validateDoctorFamilyAccess(2, 100)
            );

            assertTrue(exception.getMessage().contains("Not authorized to access this family"));
            verify(userRepository, times(1)).findById(2);
            verify(doctorAssignmentRepository, times(1))
                .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(2, 100, AssignmentStatus.ACTIVE);
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle empty list when getting all families")
        public void shouldHandleEmptyListWhenGettingAllFamilies() {
            // Arrange
            when(familyRepository.findAll()).thenReturn(Arrays.asList());

            // Act
            List<Family> result = familyService.getAllFamilies();

            // Assert
            assertTrue(result.isEmpty());
            verify(familyRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should handle null family name when creating")
        public void shouldHandleNullFamilyNameWhenCreating() {
            // Arrange
            Family newFamily = new Family();
            newFamily.setFamilyName(null);
            newFamily.setHeadOfFamily(headOfFamily);

            when(familyRepository.save(any(Family.class))).thenReturn(newFamily);

            // Act
            Family result = familyService.createFamily(newFamily);

            // Assert
            assertNotNull(result);
            assertNull(result.getFamilyName());
            verify(familyRepository, times(1)).save(newFamily);
        }
    }
}

