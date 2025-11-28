package com.example.famMedical.resolver;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.DoctorRequest.RequestStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.service.DoctorRequestService;

@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorRequestResolver Tests")
public class DoctorRequestResolverTest {

    @Mock
    private DoctorRequestService doctorRequestService;

    @InjectMocks
    private DoctorRequestResolver doctorRequestResolver;

    private DoctorRequest doctorRequest;
    private Family family;
    private User doctor;
    private User headOfFamily;

    @BeforeEach
    public void setUp() {
        // Setup doctor
        doctor = new User();
        doctor.setUserID(1);
        doctor.setEmail("doctor@example.com");
        doctor.setFullName("Dr. John");
        doctor.setRole(UserRole.BacSi);

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
    @DisplayName("Query Mapping Tests")
    class QueryMappingTests {

        @Test
        @DisplayName("Should get doctor request by family ID - success")
        public void shouldGetDoctorRequestByFamilyID_Success() {
            // Arrange
            when(doctorRequestService.getDoctorRequestByFamilyId(100)).thenReturn(doctorRequest);

            // Act
            DoctorRequest result = doctorRequestResolver.getDoctorRequestByFamilyID(100);

            // Assert
            assertNotNull(result);
            assertEquals(doctorRequest.getRequestID(), result.getRequestID());
            assertEquals(doctorRequest.getFamily().getFamilyID(), result.getFamily().getFamilyID());
            verify(doctorRequestService, times(1)).getDoctorRequestByFamilyId(100);
        }

        @Test
        @DisplayName("Should get doctor request by family ID - null")
        public void shouldGetDoctorRequestByFamilyID_Null() {
            // Arrange
            when(doctorRequestService.getDoctorRequestByFamilyId(999)).thenReturn(null);

            // Act
            DoctorRequest result = doctorRequestResolver.getDoctorRequestByFamilyID(999);

            // Assert
            assertNull(result);
            verify(doctorRequestService, times(1)).getDoctorRequestByFamilyId(999);
        }
    }

    @Nested
    @DisplayName("Mutation Mapping Tests")
    class MutationMappingTests {

        @Test
        @DisplayName("Should delete doctor request - success")
        public void shouldDeleteDoctorRequest_Success() {
            // Arrange
            when(doctorRequestService.deleteDoctorRequest(1)).thenReturn(true);

            // Act
            Boolean result = doctorRequestResolver.deleteDoctorRequest(1);

            // Assert
            assertTrue(result);
            verify(doctorRequestService, times(1)).deleteDoctorRequest(1);
        }

        @Test
        @DisplayName("Should delete doctor request - failure")
        public void shouldDeleteDoctorRequest_Failure() {
            // Arrange
            when(doctorRequestService.deleteDoctorRequest(999)).thenReturn(false);

            // Act
            Boolean result = doctorRequestResolver.deleteDoctorRequest(999);

            // Assert
            assertFalse(result);
            verify(doctorRequestService, times(1)).deleteDoctorRequest(999);
        }

        @Test
        @DisplayName("Should create doctor request - success")
        public void shouldCreateDRequest_Success() {
            // Arrange
            when(doctorRequestService.createDoctorRequest("1", "10")).thenReturn(doctorRequest);

            // Act
            DoctorRequest result = doctorRequestResolver.createDRequest("1", "10");

            // Assert
            assertNotNull(result);
            assertEquals(doctorRequest.getRequestID(), result.getRequestID());
            assertEquals(RequestStatus.PENDING, result.getStatus());
            assertNotNull(result.getRequestDate());
            verify(doctorRequestService, times(1)).createDoctorRequest("1", "10");
        }

        @Test
        @DisplayName("Should create doctor request with valid input")
        public void shouldCreateDRequest_WithValidInput() {
            // Arrange
            DoctorRequest newRequest = new DoctorRequest();
            newRequest.setRequestID(2);
            newRequest.setFamily(family);
            newRequest.setDoctor(doctor);
            newRequest.setStatus(RequestStatus.PENDING);
            newRequest.setRequestDate(LocalDateTime.now());

            when(doctorRequestService.createDoctorRequest("1", "10")).thenReturn(newRequest);

            // Act
            DoctorRequest result = doctorRequestResolver.createDRequest("1", "10");

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getRequestID());
            verify(doctorRequestService, times(1)).createDoctorRequest("1", "10");
        }
    }

    @Nested
    @DisplayName("Respond To Doctor Request Tests")
    class RespondToDoctorRequestTests {

        @Test
        @DisplayName("Should respond to doctor request - accept")
        public void shouldRespondToDoctorRequest_Accept() {
            // Arrange
            doctorRequest.setStatus(RequestStatus.ACCEPTED);
            doctorRequest.setResponseMessage("Accepted");
            doctorRequest.setResponseDate(LocalDateTime.now());

            when(doctorRequestService.respondToRequest(1, 1, RequestStatus.ACCEPTED, "Accepted"))
                .thenReturn(doctorRequest);

            // Act
            DoctorRequest result = doctorRequestResolver.respondToDoctorRequest(
                doctor, 1, RequestStatus.ACCEPTED, "Accepted"
            );

            // Assert
            assertNotNull(result);
            assertEquals(RequestStatus.ACCEPTED, result.getStatus());
            assertEquals("Accepted", result.getResponseMessage());
            verify(doctorRequestService, times(1))
                .respondToRequest(1, 1, RequestStatus.ACCEPTED, "Accepted");
        }

        @Test
        @DisplayName("Should respond to doctor request - reject")
        public void shouldRespondToDoctorRequest_Reject() {
            // Arrange
            doctorRequest.setStatus(RequestStatus.REJECTED);
            doctorRequest.setResponseMessage("Rejected");
            doctorRequest.setResponseDate(LocalDateTime.now());

            when(doctorRequestService.respondToRequest(1, 1, RequestStatus.REJECTED, "Rejected"))
                .thenReturn(doctorRequest);

            // Act
            DoctorRequest result = doctorRequestResolver.respondToDoctorRequest(
                doctor, 1, RequestStatus.REJECTED, "Rejected"
            );

            // Assert
            assertNotNull(result);
            assertEquals(RequestStatus.REJECTED, result.getStatus());
            assertEquals("Rejected", result.getResponseMessage());
            verify(doctorRequestService, times(1))
                .respondToRequest(1, 1, RequestStatus.REJECTED, "Rejected");
        }

        @Test
        @DisplayName("Should use authenticated doctor user ID")
        public void shouldUseAuthenticatedDoctorUserID() {
            // Arrange
            User authenticatedDoctor = new User();
            authenticatedDoctor.setUserID(5);
            authenticatedDoctor.setRole(UserRole.BacSi);

            doctorRequest.setStatus(RequestStatus.ACCEPTED);
            when(doctorRequestService.respondToRequest(1, 5, RequestStatus.ACCEPTED, "Message"))
                .thenReturn(doctorRequest);

            // Act
            DoctorRequest result = doctorRequestResolver.respondToDoctorRequest(
                authenticatedDoctor, 1, RequestStatus.ACCEPTED, "Message"
            );

            // Assert
            assertNotNull(result);
            verify(doctorRequestService, times(1))
                .respondToRequest(1, 5, RequestStatus.ACCEPTED, "Message");
        }

        @Test
        @DisplayName("Should handle null message in respondToDoctorRequest")
        public void shouldHandleNullMessageInRespondToDoctorRequest() {
            // Arrange
            doctorRequest.setStatus(RequestStatus.ACCEPTED);
            doctorRequest.setResponseMessage(null);

            when(doctorRequestService.respondToRequest(1, 1, RequestStatus.ACCEPTED, null))
                .thenReturn(doctorRequest);

            // Act
            DoctorRequest result = doctorRequestResolver.respondToDoctorRequest(
                doctor, 1, RequestStatus.ACCEPTED, null
            );

            // Assert
            assertNotNull(result);
            verify(doctorRequestService, times(1))
                .respondToRequest(1, 1, RequestStatus.ACCEPTED, null);
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle null return from service in getDoctorRequestByFamilyID")
        public void shouldHandleNullReturnFromService() {
            // Arrange
            when(doctorRequestService.getDoctorRequestByFamilyId(999)).thenReturn(null);

            // Act
            DoctorRequest result = doctorRequestResolver.getDoctorRequestByFamilyID(999);

            // Assert
            assertNull(result);
            verify(doctorRequestService, times(1)).getDoctorRequestByFamilyId(999);
        }

        @Test
        @DisplayName("Should handle exception from createDRequest")
        public void shouldHandleExceptionFromCreateDRequest() {
            // Arrange
            when(doctorRequestService.createDoctorRequest("999", "10"))
                .thenThrow(new IllegalArgumentException("User not found"));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                doctorRequestResolver.createDRequest("999", "10")
            );

            assertTrue(exception.getMessage().contains("User not found"));
            verify(doctorRequestService, times(1)).createDoctorRequest("999", "10");
        }

        @Test
        @DisplayName("Should handle exception from respondToDoctorRequest")
        public void shouldHandleExceptionFromRespondToDoctorRequest() {
            // Arrange
            when(doctorRequestService.respondToRequest(999, 1, RequestStatus.ACCEPTED, "Message"))
                .thenThrow(new com.example.famMedical.exception.NotFoundException("Request not found"));

            // Act & Assert
            com.example.famMedical.exception.NotFoundException exception = 
                assertThrows(com.example.famMedical.exception.NotFoundException.class, () ->
                    doctorRequestResolver.respondToDoctorRequest(
                        doctor, 999, RequestStatus.ACCEPTED, "Message"
                    )
                );

            assertTrue(exception.getMessage().contains("Request not found"));
            verify(doctorRequestService, times(1))
                .respondToRequest(999, 1, RequestStatus.ACCEPTED, "Message");
        }
    }
}

