package com.example.famMedical.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.example.famMedical.Entity.DoctorAssignment;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.DoctorRequest.RequestStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.DoctorRequestRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorRequestService Tests")
public class DoctorRequestServiceTest {

    @Mock
    private DoctorRequestRepository doctorRequestRepository;

    @Mock
    private DoctorAssignmentRepository doctorAssignmentRepository;

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private MessageService messageService;

    @InjectMocks
    private DoctorRequestService doctorRequestService;

    private DoctorRequest doctorRequest;
    private Family family;
    private User doctor;
    private User headOfFamily;
    private User unauthorizedDoctor;

    @BeforeEach
    public void setUp() {
        // Setup doctor
        doctor = new User();
        doctor.setUserID(1);
        doctor.setEmail("doctor@example.com");
        doctor.setFullName("Dr. John");
        doctor.setRole(UserRole.BacSi);

        // Setup unauthorized doctor
        unauthorizedDoctor = new User();
        unauthorizedDoctor.setUserID(2);
        unauthorizedDoctor.setEmail("otherdoctor@example.com");
        unauthorizedDoctor.setFullName("Dr. Other");
        unauthorizedDoctor.setRole(UserRole.BacSi);

        // Setup head of family
        headOfFamily = new User();
        headOfFamily.setUserID(10);
        headOfFamily.setEmail("head@example.com");
        headOfFamily.setFullName("Head of Family");
        headOfFamily.setRole(UserRole.ChuHo);

        // Setup family
        family = new Family();
        family.setFamilyID(100);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(headOfFamily);

        // Setup doctor request
        doctorRequest = new DoctorRequest();
        doctorRequest.setRequestID(1);
        doctorRequest.setFamily(family);
        doctorRequest.setDoctor(doctor);
        doctorRequest.setMessage("Request message");
        doctorRequest.setStatus(RequestStatus.PENDING);
        doctorRequest.setRequestDate(LocalDateTime.now());
    }

    @Nested
    @DisplayName("Get Doctor Request Operations")
    class GetDoctorRequestTests {

        @Test
        @DisplayName("Should get doctor request by family ID - success")
        public void shouldGetDoctorRequestByFamilyId_Success() {
            // Arrange
            when(doctorRequestRepository.findTopByFamily_FamilyIDOrderByRequestDateDesc(100))
                .thenReturn(doctorRequest);

            // Act
            DoctorRequest result = doctorRequestService.getDoctorRequestByFamilyId(100);

            // Assert
            assertNotNull(result);
            assertEquals(doctorRequest.getRequestID(), result.getRequestID());
            assertEquals(doctorRequest.getFamily().getFamilyID(), result.getFamily().getFamilyID());
            verify(doctorRequestRepository, times(1))
                .findTopByFamily_FamilyIDOrderByRequestDateDesc(100);
        }

        @Test
        @DisplayName("Should return null when no doctor request found")
        public void shouldReturnNullWhenNoDoctorRequestFound() {
            // Arrange
            when(doctorRequestRepository.findTopByFamily_FamilyIDOrderByRequestDateDesc(999))
                .thenReturn(null);

            // Act
            DoctorRequest result = doctorRequestService.getDoctorRequestByFamilyId(999);

            // Assert
            assertNull(result);
            verify(doctorRequestRepository, times(1))
                .findTopByFamily_FamilyIDOrderByRequestDateDesc(999);
        }

        @Test
        @DisplayName("Should get doctor assignment by family ID")
        public void shouldGetDoctorAssignmentByFamilyId() {
            // Arrange
            DoctorAssignment assignment = DoctorAssignment.builder()
                .assignmentID(1)
                .doctor(doctor)
                .family(family)
                .status(AssignmentStatus.ACTIVE)
                .startDate(LocalDateTime.now())
                .build();

            when(doctorAssignmentRepository.findTopByFamily_FamilyIDOrderByStartDateDesc(100))
                .thenReturn(assignment);

            // Act
            DoctorAssignment result = doctorRequestService.getDoctorAssignmentByFamilyId(100);

            // Assert
            assertNotNull(result);
            assertEquals(assignment.getAssignmentID(), result.getAssignmentID());
            verify(doctorAssignmentRepository, times(1))
                .findTopByFamily_FamilyIDOrderByStartDateDesc(100);
        }

        @Test
        @DisplayName("Should get doctor request detail - success")
        public void shouldGetDoctorRequestDetail_Success() {
            // Arrange
            when(doctorRequestRepository.findByIdWithDoctor(1))
                .thenReturn(Optional.of(doctorRequest));

            // Act
            DoctorRequest result = doctorRequestService.getDoctorRequestDetail(1, 1);

            // Assert
            assertNotNull(result);
            assertEquals(doctorRequest.getRequestID(), result.getRequestID());
            verify(doctorRequestRepository, times(1)).findByIdWithDoctor(1);
        }

        @Test
        @DisplayName("Should throw exception when request not found in getDoctorRequestDetail")
        public void shouldThrowExceptionWhenRequestNotFoundInGetDetail() {
            // Arrange
            when(doctorRequestRepository.findByIdWithDoctor(999))
                .thenReturn(Optional.empty());

            // Act & Assert
            NotFoundException exception = assertThrows(NotFoundException.class, () ->
                doctorRequestService.getDoctorRequestDetail(999, 1)
            );

            assertTrue(exception.getMessage().contains("Doctor request not found"));
            verify(doctorRequestRepository, times(1)).findByIdWithDoctor(999);
        }

        @Test
        @DisplayName("Should throw exception when unauthorized doctor tries to get request detail")
        public void shouldThrowExceptionWhenUnauthorizedDoctorGetsDetail() {
            // Arrange
            when(doctorRequestRepository.findByIdWithDoctor(1))
                .thenReturn(Optional.of(doctorRequest));

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () ->
                doctorRequestService.getDoctorRequestDetail(1, 2) // unauthorizedDoctor ID
            );

            assertTrue(exception.getMessage().contains("Not authorized"));
            verify(doctorRequestRepository, times(1)).findByIdWithDoctor(1);
        }
    }

    @Nested
    @DisplayName("Create Doctor Request Operations")
    class CreateDoctorRequestTests {

        @Test
        @DisplayName("Should create doctor request successfully")
        public void shouldCreateDoctorRequestSuccessfully() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(familyRepository.findByHeadOfFamily_UserID(10)).thenReturn(family);
            when(doctorRequestRepository.save(any(DoctorRequest.class))).thenReturn(doctorRequest);

            // Act
            DoctorRequest result = doctorRequestService.createDoctorRequest("1", "10");

            // Assert
            assertNotNull(result);
            assertEquals(RequestStatus.PENDING, result.getStatus());
            assertNotNull(result.getRequestDate());
            verify(userRepository, times(1)).findById(1);
            verify(familyRepository, times(1)).findByHeadOfFamily_UserID(10);
            verify(doctorRequestRepository, times(1)).save(any(DoctorRequest.class));
        }

        @Test
        @DisplayName("Should throw exception when doctor not found")
        public void shouldThrowExceptionWhenDoctorNotFound() {
            // Arrange
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                doctorRequestService.createDoctorRequest("999", "10")
            );

            assertTrue(exception.getMessage().contains("User not found"));
            verify(userRepository, times(1)).findById(999);
            verify(familyRepository, never()).findByHeadOfFamily_UserID(anyInt());
        }
    }

    @Nested
    @DisplayName("Delete Doctor Request Operations")
    class DeleteDoctorRequestTests {

        @Test
        @DisplayName("Should delete doctor request successfully")
        public void shouldDeleteDoctorRequestSuccessfully() {
            // Arrange
            when(doctorRequestRepository.findById(1)).thenReturn(Optional.of(doctorRequest));
            doNothing().when(doctorRequestRepository).delete(doctorRequest);

            // Act
            Boolean result = doctorRequestService.deleteDoctorRequest(1);

            // Assert
            assertTrue(result);
            verify(doctorRequestRepository, times(1)).findById(1);
            verify(doctorRequestRepository, times(1)).delete(doctorRequest);
        }

        @Test
        @DisplayName("Should return false when request not found")
        public void shouldReturnFalseWhenRequestNotFound() {
            // Arrange
            when(doctorRequestRepository.findById(999)).thenReturn(Optional.empty());

            // Act
            Boolean result = doctorRequestService.deleteDoctorRequest(999);

            // Assert
            assertFalse(result);
            verify(doctorRequestRepository, times(1)).findById(999);
            verify(doctorRequestRepository, never()).delete(any(DoctorRequest.class));
        }
    }

    @Nested
    @DisplayName("Respond To Request Operations")
    class RespondToRequestTests {

        @Test
        @DisplayName("Should accept request successfully")
        public void shouldAcceptRequestSuccessfully() {
            // Arrange
            when(doctorRequestRepository.findByIdWithLock(1))
                .thenReturn(Optional.of(doctorRequest));
            when(doctorAssignmentRepository.save(any(DoctorAssignment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(doctorRequestRepository.save(any(DoctorRequest.class)))
                .thenReturn(doctorRequest);
            doNothing().when(messageService).getOrCreateConversation(1, 100);
            doNothing().when(eventPublisher).publishEvent(any());

            // Act
            DoctorRequest result = doctorRequestService.respondToRequest(
                1, 1, RequestStatus.ACCEPTED, "Accepted message"
            );

            // Assert
            assertNotNull(result);
            assertEquals(RequestStatus.ACCEPTED, result.getStatus());
            assertNotNull(result.getResponseDate());
            assertEquals("Accepted message", result.getResponseMessage());
            verify(doctorRequestRepository, times(1)).findByIdWithLock(1);
            verify(doctorAssignmentRepository, times(1)).save(any(DoctorAssignment.class));
            verify(doctorRequestRepository, times(1)).save(any(DoctorRequest.class));
            verify(messageService, times(1)).getOrCreateConversation(1, 100);
            verify(eventPublisher, times(1)).publishEvent(any());
        }

        @Test
        @DisplayName("Should reject request successfully")
        public void shouldRejectRequestSuccessfully() {
            // Arrange
            when(doctorRequestRepository.findByIdWithLock(1))
                .thenReturn(Optional.of(doctorRequest));
            when(doctorRequestRepository.save(any(DoctorRequest.class)))
                .thenReturn(doctorRequest);
            doNothing().when(eventPublisher).publishEvent(any());

            // Act
            DoctorRequest result = doctorRequestService.respondToRequest(
                1, 1, RequestStatus.REJECTED, "Rejected message"
            );

            // Assert
            assertNotNull(result);
            assertEquals(RequestStatus.REJECTED, result.getStatus());
            assertNotNull(result.getResponseDate());
            assertEquals("Rejected message", result.getResponseMessage());
            verify(doctorRequestRepository, times(1)).findByIdWithLock(1);
            verify(doctorRequestRepository, times(1)).save(any(DoctorRequest.class));
            verify(doctorAssignmentRepository, never()).save(any(DoctorAssignment.class));
            verify(messageService, never()).getOrCreateConversation(anyInt(), anyInt());
            verify(eventPublisher, times(1)).publishEvent(any());
        }

        @Test
        @DisplayName("Should throw exception when request not found in respondToRequest")
        public void shouldThrowExceptionWhenRequestNotFoundInRespond() {
            // Arrange
            when(doctorRequestRepository.findByIdWithLock(999))
                .thenReturn(Optional.empty());

            // Act & Assert
            NotFoundException exception = assertThrows(NotFoundException.class, () ->
                doctorRequestService.respondToRequest(999, 1, RequestStatus.ACCEPTED, "Message")
            );

            assertTrue(exception.getMessage().contains("Doctor request not found"));
            verify(doctorRequestRepository, times(1)).findByIdWithLock(999);
        }

        @Test
        @DisplayName("Should throw exception when unauthorized doctor tries to respond")
        public void shouldThrowExceptionWhenUnauthorizedDoctorResponds() {
            // Arrange
            when(doctorRequestRepository.findByIdWithLock(1))
                .thenReturn(Optional.of(doctorRequest));

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () ->
                doctorRequestService.respondToRequest(1, 2, RequestStatus.ACCEPTED, "Message")
            );

            assertTrue(exception.getMessage().contains("Not authorized"));
            verify(doctorRequestRepository, times(1)).findByIdWithLock(1);
        }

        @Test
        @DisplayName("Should throw exception when request status is not PENDING")
        public void shouldThrowExceptionWhenRequestStatusNotPending() {
            // Arrange
            doctorRequest.setStatus(RequestStatus.ACCEPTED);
            when(doctorRequestRepository.findByIdWithLock(1))
                .thenReturn(Optional.of(doctorRequest));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                doctorRequestService.respondToRequest(1, 1, RequestStatus.ACCEPTED, "Message")
            );

            assertTrue(exception.getMessage().contains("Cannot process request with status"));
            verify(doctorRequestRepository, times(1)).findByIdWithLock(1);
        }

        @Test
        @DisplayName("Should handle exception when creating conversation fails")
        public void shouldHandleExceptionWhenCreatingConversationFails() {
            // Arrange
            when(doctorRequestRepository.findByIdWithLock(1))
                .thenReturn(Optional.of(doctorRequest));
            when(doctorAssignmentRepository.save(any(DoctorAssignment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(doctorRequestRepository.save(any(DoctorRequest.class)))
                .thenReturn(doctorRequest);
            doThrow(new RuntimeException("Conversation error"))
                .when(messageService).getOrCreateConversation(1, 100);
            doNothing().when(eventPublisher).publishEvent(any());

            // Act - Should not throw exception, just log error
            DoctorRequest result = doctorRequestService.respondToRequest(
                1, 1, RequestStatus.ACCEPTED, "Accepted message"
            );

            // Assert
            assertNotNull(result);
            assertEquals(RequestStatus.ACCEPTED, result.getStatus());
            verify(messageService, times(1)).getOrCreateConversation(1, 100);
            verify(eventPublisher, times(1)).publishEvent(any());
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle null family when getting assignment")
        public void shouldHandleNullFamilyWhenGettingAssignment() {
            // Arrange
            when(doctorAssignmentRepository.findTopByFamily_FamilyIDOrderByStartDateDesc(999))
                .thenReturn(null);

            // Act
            DoctorAssignment result = doctorRequestService.getDoctorAssignmentByFamilyId(999);

            // Assert
            assertNull(result);
            verify(doctorAssignmentRepository, times(1))
                .findTopByFamily_FamilyIDOrderByStartDateDesc(999);
        }

        @Test
        @DisplayName("Should handle null doctor in request when validating authorization")
        public void shouldHandleNullDoctorInRequest() {
            // Arrange
            doctorRequest.setDoctor(null);
            when(doctorRequestRepository.findByIdWithDoctor(1))
                .thenReturn(Optional.of(doctorRequest));

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () ->
                doctorRequestService.getDoctorRequestDetail(1, 1)
            );

            assertTrue(exception.getMessage().contains("Not authorized"));
        }
    }
}

