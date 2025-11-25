package com.example.famMedical.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.famMedical.Entity.*;
import com.example.famMedical.Entity.DoctorRequest.RequestStatus;
import com.example.famMedical.Entity.Payment.PaymentStatus;
import com.example.famMedical.exception.UserAlreadyExistsException;
import com.example.famMedical.repository.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService Tests")
public class AdminServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private DoctorRequestRepository doctorRequestRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private AdminService adminService;

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
        doctorRequest.setStatus(RequestStatus.PENDING);
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
        medicalRecord.setMember(member);
        medicalRecord.setDoctor(doctor);
        medicalRecord.setFileLink("http://example.com/file.pdf");
        medicalRecord.setRecordDate(LocalDate.now());
    }

    @Nested
    @DisplayName("User Management Tests")
    class UserManagementTests {

        @Test
        @DisplayName("Should list all users")
        public void shouldListAllUsers() {
            // Arrange
            List<User> expectedUsers = Arrays.asList(doctor, familyHead);
            when(userRepository.findAll()).thenReturn(expectedUsers);

            // Act
            List<User> result = adminService.listAllUsers();

            // Assert
            assertEquals(2, result.size());
            assertEquals(expectedUsers, result);
            verify(userRepository).findAll();
        }

        @Test
        @DisplayName("Should get user by id")
        public void shouldGetUserById() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));

            // Act
            User result = adminService.getUserById(1);

            // Assert
            assertNotNull(result);
            assertEquals(doctor.getUserID(), result.getUserID());
            assertEquals(doctor.getEmail(), result.getEmail());
            verify(userRepository).findById(1);
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        public void shouldThrowExceptionWhenUserNotFound() {
            // Arrange
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                adminService.getUserById(999));
            
            assertTrue(exception.getMessage().contains("User not found"));
            verify(userRepository).findById(999);
        }

        @Test
        @DisplayName("Should create user successfully")
        public void shouldCreateUserSuccessfully() {
            // Arrange
            User newUser = new User();
            newUser.setEmail("newuser@example.com");
            newUser.setFullName("New User");
            newUser.setRole(UserRole.BacSi);
            String rawPassword = "password123";

            when(userRepository.existsByEmail(newUser.getEmail())).thenReturn(false);
            when(passwordEncoder.encode(rawPassword)).thenReturn("encoded_password");
            when(userRepository.save(any(User.class))).thenReturn(newUser);

            // Act
            User result = adminService.createUser(newUser, rawPassword);

            // Assert
            assertNotNull(result);
            verify(userRepository).existsByEmail(newUser.getEmail());
            verify(passwordEncoder).encode(rawPassword);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        public void shouldThrowExceptionWhenEmailExists() {
            // Arrange
            User newUser = new User();
            newUser.setEmail("existing@example.com");
            String rawPassword = "password123";

            when(userRepository.existsByEmail(newUser.getEmail())).thenReturn(true);

            // Act & Assert
            assertThrows(UserAlreadyExistsException.class, () -> 
                adminService.createUser(newUser, rawPassword));
            
            verify(userRepository).existsByEmail(newUser.getEmail());
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should update user successfully")
        public void shouldUpdateUserSuccessfully() {
            // Arrange
            User updated = new User();
            updated.setFullName("Updated Name");
            updated.setPhoneNumber("0987654321");
            updated.setAddress("New Address");
            updated.setCccd("987654321098");
            updated.setDoctorCode("DOC001");
            updated.setRole(UserRole.BacSi);

            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(userRepository.save(any(User.class))).thenReturn(doctor);

            // Act
            User result = adminService.updateUser(1, updated);

            // Assert
            assertNotNull(result);
            verify(userRepository).findById(1);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should delete user successfully")
        public void shouldDeleteUserSuccessfully() {
            // Arrange
            doNothing().when(userRepository).deleteById(1);

            // Act
            adminService.deleteUser(1);

            // Assert
            verify(userRepository).deleteById(1);
        }

        @Test
        @DisplayName("Should change user role successfully")
        public void shouldChangeUserRoleSuccessfully() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(userRepository.save(any(User.class))).thenReturn(doctor);

            // Act
            User result = adminService.changeUserRole(1, UserRole.ChuHo);

            // Assert
            assertNotNull(result);
            verify(userRepository).findById(1);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should reset password successfully")
        public void shouldResetPasswordSuccessfully() {
            // Arrange
            String newPassword = "newpassword123";
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(passwordEncoder.encode(newPassword)).thenReturn("new_encoded_password");
            when(userRepository.save(any(User.class))).thenReturn(doctor);

            // Act
            User result = adminService.resetPassword(1, newPassword);

            // Assert
            assertNotNull(result);
            verify(userRepository).findById(1);
            verify(passwordEncoder).encode(newPassword);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should lock user account")
        public void shouldLockUserAccount() {
            // Arrange
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(userRepository.save(any(User.class))).thenReturn(doctor);

            // Act
            adminService.lockUserAccount(1);

            // Assert
            verify(userRepository).findById(1);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should unlock user account")
        public void shouldUnlockUserAccount() {
            // Arrange
            doctor.setLocked(true);
            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(userRepository.save(any(User.class))).thenReturn(doctor);

            // Act
            adminService.unlockUserAccount(1);

            // Assert
            verify(userRepository).findById(1);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should list all doctors")
        public void shouldListAllDoctors() {
            // Arrange
            User doctor2 = new User();
            doctor2.setUserID(3);
            doctor2.setRole(UserRole.BacSi);
            List<User> allUsers = Arrays.asList(doctor, familyHead, doctor2);
            when(userRepository.findAll()).thenReturn(allUsers);

            // Act
            List<User> result = adminService.listAllDoctors();

            // Assert
            assertEquals(2, result.size());
            assertTrue(result.stream().allMatch(u -> u.getRole() == UserRole.BacSi));
            verify(userRepository).findAll();
        }
    }

    @Nested
    @DisplayName("Patient (Member) Management Tests")
    class PatientManagementTests {

        @Test
        @DisplayName("Should list all patients")
        public void shouldListAllPatients() {
            // Arrange
            List<Member> expectedMembers = Arrays.asList(member);
            when(memberRepository.findAllWithFamily()).thenReturn(expectedMembers);

            // Act
            List<Member> result = adminService.listAllPatients();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedMembers, result);
            verify(memberRepository).findAllWithFamily();
        }

        @Test
        @DisplayName("Should get patient by id")
        public void shouldGetPatientById() {
            // Arrange
            when(memberRepository.findById(10)).thenReturn(Optional.of(member));

            // Act
            Member result = adminService.getPatientById(10);

            // Assert
            assertNotNull(result);
            assertEquals(member.getMemberID(), result.getMemberID());
            assertEquals(member.getFullName(), result.getFullName());
            verify(memberRepository).findById(10);
        }

        @Test
        @DisplayName("Should throw exception when patient not found")
        public void shouldThrowExceptionWhenPatientNotFound() {
            // Arrange
            when(memberRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                adminService.getPatientById(999));
            
            assertTrue(exception.getMessage().contains("Patient not found"));
            verify(memberRepository).findById(999);
        }

        @Test
        @DisplayName("Should create patient successfully")
        public void shouldCreatePatientSuccessfully() {
            // Arrange
            Member newMember = new Member();
            newMember.setFullName("New Member");
            newMember.setFamily(family);

            when(memberRepository.save(any(Member.class))).thenReturn(newMember);

            // Act
            Member result = adminService.createPatient(newMember);

            // Assert
            assertNotNull(result);
            verify(memberRepository).save(any(Member.class));
        }

        @Test
        @DisplayName("Should update patient successfully")
        public void shouldUpdatePatientSuccessfully() {
            // Arrange
            Member updated = new Member();
            updated.setFullName("Updated Name");
            updated.setPhoneNumber("0987654321");
            updated.setDateOfBirth(LocalDate.of(1995, 5, 15));
            updated.setGender(Member.Gender.Nữ);
            updated.setCccd("987654321098");
            updated.setRelationship("Vợ");

            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(memberRepository.save(any(Member.class))).thenReturn(member);

            // Act
            Member result = adminService.updatePatient(10, updated);

            // Assert
            assertNotNull(result);
            verify(memberRepository).findById(10);
            verify(memberRepository).save(any(Member.class));
        }

        @Test
        @DisplayName("Should delete patient successfully")
        public void shouldDeletePatientSuccessfully() {
            // Arrange
            doNothing().when(memberRepository).deleteById(10);

            // Act
            adminService.deletePatient(10);

            // Assert
            verify(memberRepository).deleteById(10);
        }

        @Test
        @DisplayName("Should get medical records for patient")
        public void shouldGetMedicalRecordsForPatient() {
            // Arrange
            List<MedicalRecord> expectedRecords = Arrays.asList(medicalRecord);
            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordRepository.findByMember_MemberID(10)).thenReturn(expectedRecords);

            // Act
            List<MedicalRecord> result = adminService.getMedicalRecordsForPatient(10);

            // Assert
            assertEquals(1, result.size());     
            assertEquals(expectedRecords, result);
            verify(memberRepository).findById(10);
            verify(medicalRecordRepository).findByMember_MemberID(10);
        }

        @Test
        @DisplayName("Should count new patients per month")
        public void shouldCountNewPatientsPerMonth() {
            // Arrange
            Member member2 = new Member();
            member2.setMemberID(11);
            member2.setCreatedAt(LocalDateTime.of(2024, 1, 15, 10, 0));
            
            Member member3 = new Member();
            member3.setMemberID(12);
            member3.setCreatedAt(LocalDateTime.of(2024, 2, 20, 10, 0));

            member.setCreatedAt(LocalDateTime.of(2024, 1, 10, 10, 0));
            
            List<Member> allMembers = Arrays.asList(member, member2, member3);
            when(memberRepository.findAll()).thenReturn(allMembers);

            // Act
            Map<String, Long> result = adminService.countNewPatientsPerMonth();

            // Assert
            assertNotNull(result);
            assertEquals(2L, result.get("2024-01"));
            assertEquals(1L, result.get("2024-02"));
            verify(memberRepository).findAll();
        }
    }

    @Nested
    @DisplayName("Doctor Request Management Tests")
    class DoctorRequestManagementTests {

        @Test
        @DisplayName("Should list all doctor requests")
        public void shouldListAllDoctorRequests() {
            // Arrange
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(doctorRequestRepository.findAllWithRelations()).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminService.listAllDoctorRequests();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedRequests, result);
            verify(doctorRequestRepository).findAllWithRelations();
        }

        @Test
        @DisplayName("Should list doctor requests by status")
        public void shouldListDoctorRequestsByStatus() {
            // Arrange
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(doctorRequestRepository.findByStatus(RequestStatus.PENDING)).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminService.listDoctorRequestsByStatus(RequestStatus.PENDING);

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedRequests, result);
            verify(doctorRequestRepository).findByStatus(RequestStatus.PENDING);
        }

        @Test
        @DisplayName("Should get doctor request by id")
        public void shouldGetDoctorRequestById() {
            // Arrange
            when(doctorRequestRepository.findByIdWithRelations(1)).thenReturn(Optional.of(doctorRequest));

            // Act
            DoctorRequest result = adminService.getDoctorRequestById(1);

            // Assert
            assertNotNull(result);
            assertEquals(doctorRequest.getRequestID(), result.getRequestID());
            verify(doctorRequestRepository).findByIdWithRelations(1);
        }

        @Test
        @DisplayName("Should throw exception when doctor request not found")
        public void shouldThrowExceptionWhenDoctorRequestNotFound() {
            // Arrange
            when(doctorRequestRepository.findByIdWithRelations(999)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                adminService.getDoctorRequestById(999));
            
            assertTrue(exception.getMessage().contains("Doctor request not found"));
            verify(doctorRequestRepository).findByIdWithRelations(999);
        }

        @Test
        @DisplayName("Should approve doctor request successfully")
        public void shouldApproveDoctorRequestSuccessfully() {
            // Arrange
            when(doctorRequestRepository.findById(1)).thenReturn(Optional.of(doctorRequest));
            when(doctorRequestRepository.save(any(DoctorRequest.class))).thenReturn(doctorRequest);
            when(userRepository.save(any(User.class))).thenReturn(doctor);

            // Act
            User result = adminService.verifyDoctorRequest(1, true);

            // Assert
            assertNotNull(result);
            assertEquals(RequestStatus.ACCEPTED, doctorRequest.getStatus());
            assertTrue(doctor.isVerified());
            verify(doctorRequestRepository).findById(1);
            verify(doctorRequestRepository).save(any(DoctorRequest.class));
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should reject doctor request successfully")
        public void shouldRejectDoctorRequestSuccessfully() {
            // Arrange
            when(doctorRequestRepository.findById(1)).thenReturn(Optional.of(doctorRequest));
            when(doctorRequestRepository.save(any(DoctorRequest.class))).thenReturn(doctorRequest);

            // Act
            User result = adminService.verifyDoctorRequest(1, false);

            // Assert
            assertNotNull(result);
            assertEquals(RequestStatus.REJECTED, doctorRequest.getStatus());
            verify(doctorRequestRepository).findById(1);
            verify(doctorRequestRepository).save(any(DoctorRequest.class));
            verify(userRepository, never()).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Payment Management Tests")
    class PaymentManagementTests {

        @Test
        @DisplayName("Should list all payments")
        public void shouldListAllPayments() {
            // Arrange
            List<Payment> expectedPayments = Arrays.asList(payment);
            when(paymentRepository.findAllWithUser()).thenReturn(expectedPayments);

            // Act
            List<Payment> result = adminService.listAllPayments();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedPayments, result);
            verify(paymentRepository).findAllWithUser();
        }

        @Test
        @DisplayName("Should list payments by status")
        public void shouldListPaymentsByStatus() {
            // Arrange
            List<Payment> expectedPayments = Arrays.asList(payment);
            when(paymentRepository.findByPaymentStatus(PaymentStatus.Pending)).thenReturn(expectedPayments);

            // Act
            List<Payment> result = adminService.listPaymentsByStatus("Pending");

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedPayments, result);
            verify(paymentRepository).findByPaymentStatus(PaymentStatus.Pending);
        }

        @Test
        @DisplayName("Should update payment successfully")
        public void shouldUpdatePaymentSuccessfully() {
            // Arrange
            Payment updated = new Payment();
            updated.setPaymentStatus(PaymentStatus.Completed);
            updated.setAmount(new BigDecimal("150000"));

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

            // Act
            Payment result = adminService.updatePayment(1, updated);

            // Assert
            assertNotNull(result);
            verify(paymentRepository).findById(1);
            verify(paymentRepository).save(any(Payment.class));
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        public void shouldThrowExceptionWhenPaymentNotFound() {
            // Arrange
            Payment updated = new Payment();
            when(paymentRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                adminService.updatePayment(999, updated));
            
            assertTrue(exception.getMessage().contains("Payment not found"));
            verify(paymentRepository).findById(999);
            verify(paymentRepository, never()).save(any(Payment.class));
        }
    }

    @Nested
    @DisplayName("Edge Cases and Additional Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle null password when creating user")
        public void shouldHandleNullPasswordWhenCreatingUser() {
            // Arrange
            User newUser = new User();
            newUser.setEmail("newuser@example.com");
            newUser.setFullName("New User");
            newUser.setRole(UserRole.BacSi);

            when(userRepository.existsByEmail(newUser.getEmail())).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(newUser);

            // Act
            User result = adminService.createUser(newUser, null);

            // Assert
            assertNotNull(result);
            verify(userRepository).existsByEmail(newUser.getEmail());
            verify(passwordEncoder, never()).encode(anyString());
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should handle null email when creating user")
        public void shouldHandleNullEmailWhenCreatingUser() {
            // Arrange
            User newUser = new User();
            newUser.setEmail(null);
            newUser.setFullName("New User");
            String rawPassword = "password123";

            when(passwordEncoder.encode(rawPassword)).thenReturn("encoded_password");
            when(userRepository.save(any(User.class))).thenReturn(newUser);

            // Act
            User result = adminService.createUser(newUser, rawPassword);

            // Assert
            assertNotNull(result);
            verify(userRepository, never()).existsByEmail(anyString());
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should handle partial update when some fields are null")
        public void shouldHandlePartialUpdateWhenSomeFieldsAreNull() {
            // Arrange
            Member updated = new Member();
            updated.setFullName("Updated Name");
            // Other fields are null

            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(memberRepository.save(any(Member.class))).thenReturn(member);

            // Act
            Member result = adminService.updatePatient(10, updated);

            // Assert
            assertNotNull(result);
            verify(memberRepository).findById(10);
            verify(memberRepository).save(any(Member.class));
        }

        @Test
        @DisplayName("Should handle empty list when listing all users")
        public void shouldHandleEmptyListWhenListingAllUsers() {
            // Arrange
            when(userRepository.findAll()).thenReturn(Arrays.asList());

            // Act
            List<User> result = adminService.listAllUsers();

            // Assert
            assertTrue(result.isEmpty());
            verify(userRepository).findAll();
        }

        @Test
        @DisplayName("Should handle empty list when listing all doctors")
        public void shouldHandleEmptyListWhenListingAllDoctors() {
            // Arrange
            when(userRepository.findAll()).thenReturn(Arrays.asList(familyHead)); // No doctors

            // Act
            List<User> result = adminService.listAllDoctors();

            // Assert
            assertTrue(result.isEmpty());
            verify(userRepository).findAll();
        }

        @Test
        @DisplayName("Should handle empty list when listing all patients")
        public void shouldHandleEmptyListWhenListingAllPatients() {
            // Arrange
            when(memberRepository.findAllWithFamily()).thenReturn(Arrays.asList());

            // Act
            List<Member> result = adminService.listAllPatients();

            // Assert
            assertTrue(result.isEmpty());
            verify(memberRepository).findAllWithFamily();
        }

        @Test
        @DisplayName("Should handle countNewPatientsPerMonth with empty list")
        public void shouldHandleCountNewPatientsPerMonthWithEmptyList() {
            // Arrange
            when(memberRepository.findAll()).thenReturn(Arrays.asList());

            // Act
            Map<String, Long> result = adminService.countNewPatientsPerMonth();

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(memberRepository).findAll();
        }

        @Test
        @DisplayName("Should handle countNewPatientsPerMonth with null createdAt")
        public void shouldHandleCountNewPatientsPerMonthWithNullCreatedAt() {
            // Arrange
            Member memberWithNullDate = new Member();
            memberWithNullDate.setCreatedAt(null);
            when(memberRepository.findAll()).thenReturn(Arrays.asList(memberWithNullDate));

            // Act & Assert
            assertThrows(NullPointerException.class, () -> 
                adminService.countNewPatientsPerMonth());
        }

        @Test
        @DisplayName("Should handle listPaymentsByStatus with invalid status")
        public void shouldHandleListPaymentsByStatusWithInvalidStatus() {
            // Arrange
            String invalidStatus = "INVALID_STATUS";

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminService.listPaymentsByStatus(invalidStatus));
        }

        @Test
        @DisplayName("Should handle updateUser with all null fields")
        public void shouldHandleUpdateUserWithAllNullFields() {
            // Arrange
            User updated = new User();
            // All fields are null

            when(userRepository.findById(1)).thenReturn(Optional.of(doctor));
            when(userRepository.save(any(User.class))).thenReturn(doctor);

            // Act
            User result = adminService.updateUser(1, updated);

            // Assert
            assertNotNull(result);
            verify(userRepository).findById(1);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should handle getMedicalRecordsForPatient with empty records")
        public void shouldHandleGetMedicalRecordsForPatientWithEmptyRecords() {
            // Arrange
            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordRepository.findByMember_MemberID(10)).thenReturn(Arrays.asList());

            // Act
            List<MedicalRecord> result = adminService.getMedicalRecordsForPatient(10);

            // Assert
            assertTrue(result.isEmpty());   
            verify(memberRepository).findById(10);
            verify(medicalRecordRepository).findByMember_MemberID(10);
        }
    }
}

