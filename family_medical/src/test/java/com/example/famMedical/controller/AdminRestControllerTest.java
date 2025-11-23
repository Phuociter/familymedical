package com.example.famMedical.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.famMedical.Entity.*;
import com.example.famMedical.Entity.DoctorRequest.RequestStatus;
import com.example.famMedical.Entity.Payment.PaymentStatus;
import com.example.famMedical.repository.*;
import com.example.famMedical.service.AdminService;
import com.example.famMedical.service.CloudinaryService;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminRestController Tests")
public class AdminRestControllerTest {

    @Mock
    private AdminService adminService;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private DoctorAssignmentRepository doctorAssignmentRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private DoctorRequestRepository doctorRequestRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private AdminRestController adminRestController;

    private User doctor;
    private User familyHead;
    private Member member;
    private Family family;
    private DoctorRequest doctorRequest;
    private Payment payment;
    private MedicalRecord medicalRecord;

    @BeforeEach
    public void setUp() {
        // Setup User - Doctor
        doctor = new User();
        doctor.setUserID(1);
        doctor.setEmail("doctor@example.com");
        doctor.setFullName("Dr. John Doe");
        doctor.setRole(UserRole.BacSi);
        doctor.setPasswordHash("encoded_password");
        doctor.setVerified(false);
        doctor.setLocked(false);

        // Setup User - Family Head
        familyHead = new User();
        familyHead.setUserID(2);
        familyHead.setEmail("head@example.com");
        familyHead.setFullName("Family Head");
        familyHead.setRole(UserRole.ChuHo);
        familyHead.setPasswordHash("encoded_password");

        // Setup Family
        family = new Family();
        family.setFamilyID(100);
        family.setFamilyName("Test Family");
        family.setAddress("123 Test Street");
        family.setHeadOfFamily(familyHead);

        // Setup Member
        member = new Member();
        member.setMemberID(10);
        member.setFullName("Test Member");
        member.setFamily(family);
        member.setDateOfBirth(LocalDate.of(1990, 1, 1));
        member.setGender(Member.Gender.Nam);
        member.setPhoneNumber("0123456789");
        member.setCccd("123456789012");
        member.setRelationship("Con");
        member.setCreatedAt(LocalDateTime.now());

        // Setup DoctorRequest
        doctorRequest = new DoctorRequest();
        doctorRequest.setRequestID(1);
        doctorRequest.setFamily(family);
        doctorRequest.setDoctor(doctor);
        doctorRequest.setMessage("Request message");
        doctorRequest.setStatus(RequestStatus.Pending);
        doctorRequest.setRequestDate(LocalDateTime.now());

        // Setup Payment
        payment = new Payment();
        payment.setPaymentId(1);
        payment.setUser(familyHead);
        payment.setPackageType(Payment.PackageType.ONE_MONTH);
        payment.setAmount(new BigDecimal("100000"));
        payment.setPaymentStatus(PaymentStatus.Pending);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setExpiryDate(LocalDateTime.now().plusMonths(1));
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        // Setup MedicalRecord
        medicalRecord = new MedicalRecord();
        medicalRecord.setRecordID(1);
        medicalRecord.setMemberID(member);
        medicalRecord.setDoctorID(doctor);
        medicalRecord.setFileLink("http://example.com/file.pdf");
        medicalRecord.setRecordDate(LocalDate.now());
    }

    @Nested
    @DisplayName("Member Management Endpoints")
    class MemberManagementEndpoints {

        @Test
        @DisplayName("GET /api/members - Should return list of members")
        public void shouldListMembers() {
            // Arrange
            List<Member> expectedMembers = Arrays.asList(member);
            when(adminService.listAllPatients()).thenReturn(expectedMembers);

            // Act
            List<Member> result = adminRestController.listMembers();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedMembers, result);
            verify(adminService).listAllPatients();
        }

        @Test
        @DisplayName("POST /api/members - Should create member successfully")
        public void shouldCreateMember() {
            // Arrange
            Integer familyId = 100;
            when(familyRepository.findById(familyId)).thenReturn(Optional.of(family));
            when(adminService.createPatient(any(Member.class))).thenReturn(member);

            // Act
            ResponseEntity<Member> response = adminRestController.createMember(familyId);

            // Assert
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(familyRepository).findById(familyId);
            verify(adminService).createPatient(any(Member.class));
        }

        @Test
        @DisplayName("POST /api/members - Should throw exception when family not found")
        public void shouldThrowExceptionWhenFamilyNotFound() {
            // Arrange
            Integer familyId = 999;
            when(familyRepository.findById(familyId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminRestController.createMember(familyId));
            
            verify(familyRepository).findById(familyId);
            verify(adminService, never()).createPatient(any(Member.class));
        }

        @Test
        @DisplayName("PUT /api/members/{id} - Should update member successfully")
        public void shouldUpdateMember() {
            // Arrange
            Integer memberId = 10;
            Member updated = new Member();
            updated.setFullName("Updated Name");
            updated.setPhoneNumber("0987654321");

            when(adminService.updatePatient(memberId, updated)).thenReturn(member);

            // Act
            Member result = adminRestController.updateMember(memberId, updated);

            // Assert
            assertNotNull(result);
            verify(adminService).updatePatient(memberId, updated);
        }

        @Test
        @DisplayName("DELETE /api/members/{id} - Should delete member successfully")
        public void shouldDeleteMember() {
            // Arrange
            Integer memberId = 10;
            doNothing().when(adminService).deletePatient(memberId);

            // Act
            ResponseEntity<Void> response = adminRestController.deleteMember(memberId);

            // Assert
            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(adminService).deletePatient(memberId);
        }

        @Test
        @DisplayName("GET /api/members/{memberId}/files - Should return member files")
        public void shouldGetMemberFiles() {
            // Arrange
            Integer memberId = 10;
            List<MedicalRecord> expectedRecords = Arrays.asList(medicalRecord);
            when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
            when(medicalRecordRepository.findByMember_MemberID(memberId)).thenReturn(expectedRecords);

            // Act
            ResponseEntity<List<MedicalRecord>> response = adminRestController.getMemberFiles(memberId);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(1, response.getBody().size());
            verify(memberRepository).findById(memberId);
            verify(medicalRecordRepository).findByMember_MemberID(memberId);
        }

        @Test
        @DisplayName("PUT /api/files/{fileId} - Should update medical record")
        public void shouldUpdateMedicalRecord() {
            // Arrange
            Integer fileId = 1;
            MedicalRecord updated = new MedicalRecord();
            updated.setSymptoms("Fever");
            updated.setDiagnosis("Common cold");
            updated.setTreatmentPlan("Rest and medication");

            when(medicalRecordRepository.findById(fileId)).thenReturn(Optional.of(medicalRecord));
            when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(medicalRecord);

            // Act
            ResponseEntity<MedicalRecord> response = adminRestController.updateMedicalRecord(fileId, updated);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(medicalRecordRepository).findById(fileId);
            verify(medicalRecordRepository).save(any(MedicalRecord.class));
        }

        @Test
        @DisplayName("PUT /api/members/{memberId}/assignDoctor - Should assign doctor to member")
        public void shouldAssignDoctorToMember() {
            // Arrange
            Integer memberId = 10;
            Integer doctorId = 1;
            Map<String, Integer> body = new HashMap<>();
            body.put("doctorId", doctorId);

            when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
            when(userRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
            when(doctorAssignmentRepository.save(any(DoctorAssignment.class))).thenReturn(new DoctorAssignment());

            // Act
            ResponseEntity<?> response = adminRestController.assignDoctorToMember(memberId, body);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(memberRepository).findById(memberId);
            verify(userRepository).findById(doctorId);
            verify(doctorAssignmentRepository).save(any(DoctorAssignment.class));
        }
    }

    @Nested
    @DisplayName("Doctor Management Endpoints")
    class DoctorManagementEndpoints {

        @Test
        @DisplayName("GET /api/doctors - Should return list of doctors")
        public void shouldListDoctors() {
            // Arrange
            List<User> expectedDoctors = Arrays.asList(doctor);
            when(adminService.listAllDoctors()).thenReturn(expectedDoctors);

            // Act
            List<User> result = adminRestController.listDoctors();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedDoctors, result);
            verify(adminService).listAllDoctors();
        }

        @Test
        @DisplayName("POST /api/doctors - Should create doctor successfully")
        public void shouldCreateDoctor() {
            // Arrange
            User payload = new User();
            payload.setEmail("newdoctor@example.com");
            payload.setPasswordHash("password123");
            payload.setFullName("New Doctor");
            payload.setRole(UserRole.BacSi);

            when(adminService.createUser(payload, payload.getPasswordHash())).thenReturn(doctor);

            // Act
            ResponseEntity<User> response = adminRestController.createDoctor(payload);

            // Assert
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(adminService).createUser(payload, payload.getPasswordHash());
        }

        @Test
        @DisplayName("POST /api/doctors - Should return bad request when email or password missing")
        public void shouldReturnBadRequestWhenMissingFields() {
            // Arrange
            User payload = new User();
            payload.setFullName("New Doctor");
            // Missing email and password

            // Act
            ResponseEntity<User> response = adminRestController.createDoctor(payload);

            // Assert
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNull(response.getBody());
            verify(adminService, never()).createUser(any(), any());
        }

        @Test
        @DisplayName("PUT /api/doctors/{id} - Should update doctor successfully")
        public void shouldUpdateDoctor() {
            // Arrange
            Integer doctorId = 1;
            User payload = new User();
            payload.setFullName("Updated Doctor");
            payload.setPhoneNumber("0987654321");

            when(adminService.updateUser(doctorId, payload)).thenReturn(doctor);

            // Act
            User result = adminRestController.updateDoctor(doctorId, payload);

            // Assert
            assertNotNull(result);
            verify(adminService).updateUser(doctorId, payload);
        }

        @Test
        @DisplayName("DELETE /api/doctors/{id} - Should delete doctor successfully")
        public void shouldDeleteDoctor() {
            // Arrange
            Integer doctorId = 1;
            doNothing().when(adminService).deleteUser(doctorId);

            // Act
            ResponseEntity<Void> response = adminRestController.deleteDoctor(doctorId);

            // Assert
            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(adminService).deleteUser(doctorId);
        }
    }

    @Nested
    @DisplayName("Family Management Endpoints")
    class FamilyManagementEndpoints {

        @Test
        @DisplayName("GET /api/families - Should return list of families")
        public void shouldListFamilies() {
            // Arrange
            List<Family> expectedFamilies = Arrays.asList(family);
            when(familyRepository.findAllWithHeadOfFamily()).thenReturn(expectedFamilies);

            // Act
            List<Family> result = adminRestController.listFamilies();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedFamilies, result);
            verify(familyRepository).findAllWithHeadOfFamily();
        }

        @Test
        @DisplayName("POST /api/families - Should create family successfully")
        public void shouldCreateFamily() {
            // Arrange
            Family payload = new Family();
            payload.setFamilyName("New Family");
            payload.setAddress("New Address");

            when(familyRepository.save(any(Family.class))).thenReturn(family);

            // Act
            ResponseEntity<Family> response = adminRestController.createFamily(payload);

            // Assert
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(familyRepository).save(any(Family.class));
        }

        @Test
        @DisplayName("PUT /api/families/{id} - Should update family successfully")
        public void shouldUpdateFamily() {
            // Arrange
            Integer familyId = 100;
            Family payload = new Family();
            payload.setFamilyName("Updated Family");
            payload.setAddress("Updated Address");

            when(familyRepository.findById(familyId)).thenReturn(Optional.of(family));
            when(familyRepository.save(any(Family.class))).thenReturn(family);

            // Act
            Family result = adminRestController.updateFamily(familyId, payload);

            // Assert
            assertNotNull(result);
            verify(familyRepository).findById(familyId);
            verify(familyRepository).save(any(Family.class));
        }

        @Test
        @DisplayName("DELETE /api/families/{id} - Should delete family successfully")
        public void shouldDeleteFamily() {
            // Arrange
            Integer familyId = 100;
            doNothing().when(familyRepository).deleteById(familyId);

            // Act
            ResponseEntity<Void> response = adminRestController.deleteFamily(familyId);

            // Assert
            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(familyRepository).deleteById(familyId);
        }
    }

    @Nested
    @DisplayName("Doctor Request Management Endpoints")
    class DoctorRequestManagementEndpoints {

        @Test
        @DisplayName("GET /api/doctor-requests - Should return all doctor requests")
        public void shouldListAllDoctorRequests() {
            // Arrange
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(adminService.listAllDoctorRequests()).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminRestController.listDoctorRequests(null);

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedRequests, result);
            verify(adminService).listAllDoctorRequests();
        }

        @Test
        @DisplayName("GET /api/doctor-requests?status=Pending - Should return filtered requests")
        public void shouldListDoctorRequestsByStatus() {
            // Arrange
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(adminService.listDoctorRequestsByStatus(RequestStatus.Pending)).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminRestController.listDoctorRequests("Pending");

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedRequests, result);
            verify(adminService).listDoctorRequestsByStatus(RequestStatus.Pending);
        }

        @Test
        @DisplayName("GET /api/doctor-requests/{id} - Should return doctor request by id")
        public void shouldGetDoctorRequestById() {
            // Arrange
            Integer requestId = 1;
            when(adminService.getDoctorRequestById(requestId)).thenReturn(doctorRequest);

            // Act
            DoctorRequest result = adminRestController.getDoctorRequestById(requestId);

            // Assert
            assertNotNull(result);
            assertEquals(doctorRequest.getRequestID(), result.getRequestID());
            verify(adminService).getDoctorRequestById(requestId);
        }

        @Test
        @DisplayName("PUT /api/doctor-requests/{id}/approve - Should approve doctor request")
        public void shouldApproveDoctorRequest() {
            // Arrange
            Integer requestId = 1;
            when(adminService.verifyDoctorRequest(requestId, true)).thenReturn(doctor);

            // Act
            ResponseEntity<User> response = adminRestController.approveDoctorRequest(requestId);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(adminService).verifyDoctorRequest(requestId, true);
        }

        @Test
        @DisplayName("PUT /api/doctor-requests/{id}/reject - Should reject doctor request")
        public void shouldRejectDoctorRequest() {
            // Arrange
            Integer requestId = 1;
            when(adminService.verifyDoctorRequest(requestId, false)).thenReturn(doctor);

            // Act
            ResponseEntity<Void> response = adminRestController.rejectDoctorRequest(requestId);

            // Assert
            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(adminService).verifyDoctorRequest(requestId, false);
        }
    }

    @Nested
    @DisplayName("Payment Management Endpoints")
    class PaymentManagementEndpoints {

        @Test
        @DisplayName("GET /api/payments - Should return all payments")
        public void shouldListAllPayments() {
            // Arrange
            List<Payment> expectedPayments = Arrays.asList(payment);
            when(adminService.listAllPayments()).thenReturn(expectedPayments);

            // Act
            List<Payment> result = adminRestController.listPayments(null);

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedPayments, result);
            verify(adminService).listAllPayments();
        }

        @Test
        @DisplayName("GET /api/payments?status=Pending - Should return filtered payments")
        public void shouldListPaymentsByStatus() {
            // Arrange
            List<Payment> expectedPayments = Arrays.asList(payment);
            when(adminService.listPaymentsByStatus("PENDING")).thenReturn(expectedPayments);

            // Act
            List<Payment> result = adminRestController.listPayments("Pending");

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedPayments, result);
            verify(adminService).listPaymentsByStatus("PENDING");
        }

        @Test
        @DisplayName("GET /api/payments/{id} - Should return payment by id")
        public void shouldGetPaymentById() {
            // Arrange
            Integer paymentId = 1;
            when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

            // Act
            Payment result = adminRestController.getPaymentById(paymentId);

            // Assert
            assertNotNull(result);
            assertEquals(payment.getPaymentId(), result.getPaymentId());
            verify(paymentRepository).findById(paymentId);
        }

        @Test
        @DisplayName("POST /api/payments - Should create payment successfully")
        public void shouldCreatePayment() {
            // Arrange
            Map<String, Object> payload = new HashMap<>();
            payload.put("familyID", 100);
            payload.put("amount", 100000);
            payload.put("paymentStatus", "Pending");
            payload.put("paymentMethod", "Momo");

            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

            // Act
            ResponseEntity<Payment> response = adminRestController.createPayment(payload);

            // Assert
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(familyRepository).findById(100);
            verify(paymentRepository).save(any(Payment.class));
        }

        @Test
        @DisplayName("DELETE /api/payments/{id} - Should delete payment successfully")
        public void shouldDeletePayment() {
            // Arrange
            Integer paymentId = 1;
            doNothing().when(paymentRepository).deleteById(paymentId);

            // Act
            ResponseEntity<Void> response = adminRestController.deletePayment(paymentId);

            // Assert
            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(paymentRepository).deleteById(paymentId);
        }

        @Test
        @DisplayName("GET /api/payments/{id} - Should throw exception when payment not found")
        public void shouldThrowExceptionWhenPaymentNotFound() {
            // Arrange
            Integer paymentId = 999;
            when(paymentRepository.findById(paymentId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminRestController.getPaymentById(paymentId));
            
            verify(paymentRepository).findById(paymentId);
        }

        @Test
        @DisplayName("POST /api/payments - Should handle payment with doctorID")
        public void shouldHandlePaymentWithDoctorID() {
            // Arrange
            Map<String, Object> payload = new HashMap<>();
            payload.put("doctorID", 1);
            payload.put("amount", 100000);
            payload.put("paymentStatus", "Pending");

            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

            // Act
            ResponseEntity<Payment> response = adminRestController.createPayment(payload);

            // Assert
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(userRepository).findById(1);
            verify(paymentRepository).save(any(Payment.class));
        }

        @Test
        @DisplayName("POST /api/payments - Should throw exception when family not found")
        public void shouldThrowExceptionWhenFamilyNotFoundInPayment() {
            // Arrange
            Map<String, Object> payload = new HashMap<>();
            payload.put("familyID", 999);
            when(familyRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminRestController.createPayment(payload));
            
            verify(familyRepository).findById(999);
            verify(paymentRepository, never()).save(any());
        }

        @Test
        @DisplayName("POST /api/payments - Should handle payment with nested family object")
        public void shouldHandlePaymentWithNestedFamilyObject() {
            // Arrange
            Map<String, Object> familyMap = new HashMap<>();
            familyMap.put("familyID", 100);
            Map<String, Object> payload = new HashMap<>();
            payload.put("family", familyMap);
            payload.put("amount", 100000);

            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

            // Act
            ResponseEntity<Payment> response = adminRestController.createPayment(payload);

            // Assert
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            verify(familyRepository).findById(100);
        }
    }

    @Nested
    @DisplayName("Edge Cases and Additional Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("GET /api/members - Should return empty list")
        public void shouldReturnEmptyListForMembers() {
            // Arrange
            when(adminService.listAllPatients()).thenReturn(Arrays.asList());

            // Act
            List<Member> result = adminRestController.listMembers();

            // Assert
            assertTrue(result.isEmpty());
            verify(adminService).listAllPatients();
        }

        @Test
        @DisplayName("GET /api/doctors - Should return empty list")
        public void shouldReturnEmptyListForDoctors() {
            // Arrange
            when(adminService.listAllDoctors()).thenReturn(Arrays.asList());

            // Act
            List<User> result = adminRestController.listDoctors();

            // Assert
            assertTrue(result.isEmpty());
            verify(adminService).listAllDoctors();
        }

        @Test
        @DisplayName("GET /api/families - Should return empty list")
        public void shouldReturnEmptyListForFamilies() {
            // Arrange
            when(familyRepository.findAllWithHeadOfFamily()).thenReturn(Arrays.asList());

            // Act
            List<Family> result = adminRestController.listFamilies();

            // Assert
            assertTrue(result.isEmpty());
            verify(familyRepository).findAllWithHeadOfFamily();
        }

        @Test
        @DisplayName("GET /api/doctor-requests - Should return empty list")
        public void shouldReturnEmptyListForDoctorRequests() {
            // Arrange
            when(adminService.listAllDoctorRequests()).thenReturn(Arrays.asList());

            // Act
            List<DoctorRequest> result = adminRestController.listDoctorRequests(null);

            // Assert
            assertTrue(result.isEmpty());
            verify(adminService).listAllDoctorRequests();
        }

        @Test
        @DisplayName("GET /api/payments - Should return empty list")
        public void shouldReturnEmptyListForPayments() {
            // Arrange
            when(adminService.listAllPayments()).thenReturn(Arrays.asList());

            // Act
            List<Payment> result = adminRestController.listPayments(null);

            // Assert
            assertTrue(result.isEmpty());
            verify(adminService).listAllPayments();
        }

        @Test
        @DisplayName("PUT /api/members/{id} - Should handle partial update")
        public void shouldHandlePartialUpdateForMember() {
            // Arrange
            Integer memberId = 10;
            Member updated = new Member();
            updated.setFullName("Updated Name");
            // Other fields are null

            when(adminService.updatePatient(memberId, updated)).thenReturn(member);

            // Act
            Member result = adminRestController.updateMember(memberId, updated);

            // Assert
            assertNotNull(result);
            verify(adminService).updatePatient(memberId, updated);
        }

        @Test
        @DisplayName("PUT /api/doctors/{id} - Should handle partial update")
        public void shouldHandlePartialUpdateForDoctor() {
            // Arrange
            Integer doctorId = 1;
            User payload = new User();
            payload.setFullName("Updated Doctor");
            // Other fields are null

            when(adminService.updateUser(doctorId, payload)).thenReturn(doctor);

            // Act
            User result = adminRestController.updateDoctor(doctorId, payload);

            // Assert
            assertNotNull(result);
            verify(adminService).updateUser(doctorId, payload);
        }

        @Test
        @DisplayName("PUT /api/families/{id} - Should handle partial update")
        public void shouldHandlePartialUpdateForFamily() {
            // Arrange
            Integer familyId = 100;
            Family payload = new Family();
            payload.setFamilyName("Updated Family");
            // Address is null

            when(familyRepository.findById(familyId)).thenReturn(Optional.of(family));
            when(familyRepository.save(any(Family.class))).thenReturn(family);

            // Act
            Family result = adminRestController.updateFamily(familyId, payload);

            // Assert
            assertNotNull(result);
            verify(familyRepository).findById(familyId);
            verify(familyRepository).save(any(Family.class));
        }

        @Test
        @DisplayName("PUT /api/files/{fileId} - Should handle partial update")
        public void shouldHandlePartialUpdateForMedicalRecord() {
            // Arrange
            Integer fileId = 1;
            MedicalRecord updated = new MedicalRecord();
            updated.setSymptoms("Fever");
            // Other fields are null

            when(medicalRecordRepository.findById(fileId)).thenReturn(Optional.of(medicalRecord));
            when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(medicalRecord);

            // Act
            ResponseEntity<MedicalRecord> response = adminRestController.updateMedicalRecord(fileId, updated);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(medicalRecordRepository).findById(fileId);
            verify(medicalRecordRepository).save(any(MedicalRecord.class));
        }

        @Test
        @DisplayName("PUT /api/files/{fileId} - Should throw exception when medical record not found")
        public void shouldThrowExceptionWhenMedicalRecordNotFound() {
            // Arrange
            Integer fileId = 999;
            MedicalRecord updated = new MedicalRecord();
            when(medicalRecordRepository.findById(fileId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminRestController.updateMedicalRecord(fileId, updated));
            
            verify(medicalRecordRepository).findById(fileId);
            verify(medicalRecordRepository, never()).save(any());
        }

        @Test
        @DisplayName("GET /api/members/{memberId}/files - Should return empty list")
        public void shouldReturnEmptyListForMemberFiles() {
            // Arrange
            Integer memberId = 10;
            when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
            when(medicalRecordRepository.findByMember_MemberID(memberId)).thenReturn(Arrays.asList());

            // Act
            ResponseEntity<List<MedicalRecord>> response = adminRestController.getMemberFiles(memberId);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertTrue(response.getBody().isEmpty());
            verify(memberRepository).findById(memberId);
            verify(medicalRecordRepository).findByMember_MemberID(memberId);
        }

        @Test
        @DisplayName("GET /api/members/{memberId}/files - Should throw exception when member not found")
        public void shouldThrowExceptionWhenMemberNotFoundForFiles() {
            // Arrange
            Integer memberId = 999;
            when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminRestController.getMemberFiles(memberId));
            
            verify(memberRepository).findById(memberId);
            verify(medicalRecordRepository, never()).findByMember_MemberID(anyInt());
        }

        @Test
        @DisplayName("PUT /api/members/{memberId}/assignDoctor - Should throw exception when member not found")
        public void shouldThrowExceptionWhenMemberNotFoundForAssignment() {
            // Arrange
            Integer memberId = 999;
            Integer doctorId = 1;
            Map<String, Integer> body = new HashMap<>();
            body.put("doctorId", doctorId);
            when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminRestController.assignDoctorToMember(memberId, body));
            
            verify(memberRepository).findById(memberId);
            verify(userRepository, never()).findById(anyInt());
        }

        @Test
        @DisplayName("PUT /api/members/{memberId}/assignDoctor - Should throw exception when doctor not found")
        public void shouldThrowExceptionWhenDoctorNotFoundForAssignment() {
            // Arrange
            Integer memberId = 10;
            Integer doctorId = 999;
            Map<String, Integer> body = new HashMap<>();
            body.put("doctorId", doctorId);
            when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
            when(userRepository.findById(doctorId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminRestController.assignDoctorToMember(memberId, body));
            
            verify(memberRepository).findById(memberId);
            verify(userRepository).findById(doctorId);
        }
    }
}

