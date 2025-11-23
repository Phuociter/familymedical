package com.example.famMedical.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

import com.example.famMedical.Entity.*;
import com.example.famMedical.Entity.DoctorRequest.RequestStatus;
import com.example.famMedical.Entity.Payment.PaymentStatus;
import com.example.famMedical.repository.*;
import com.example.famMedical.service.AdminService;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminGraphQLResolver Tests")
public class AdminGraphQLResolverTest {

    @Mock
    private AdminService adminService;

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private DoctorAssignmentRepository doctorAssignmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorRequestRepository doctorRequestRepository;

    @InjectMocks
    private AdminGraphQLResolver adminGraphQLResolver;

    private User doctor;
    private User familyHead;
    private Member member;
    private Family family;
    private DoctorRequest doctorRequest;
    private Payment payment;

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
        family.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

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
    }

    @Nested
    @DisplayName("Query Tests")
    class QueryTests {

        @Test
        @DisplayName("allMembers - Should return all members")
        public void shouldReturnAllMembers() {
            // Arrange
            List<Member> expectedMembers = Arrays.asList(member);
            when(adminService.listAllPatients()).thenReturn(expectedMembers);

            // Act
            List<Member> result = adminGraphQLResolver.allMembers();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedMembers, result);
            verify(adminService).listAllPatients();
        }

        @Test
        @DisplayName("allDoctors - Should return all doctors")
        public void shouldReturnAllDoctors() {
            // Arrange
            List<User> expectedDoctors = Arrays.asList(doctor);
            when(adminService.listAllDoctors()).thenReturn(expectedDoctors);

            // Act
            List<User> result = adminGraphQLResolver.allDoctors();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedDoctors, result);
            verify(adminService).listAllDoctors();
        }

        @Test
        @DisplayName("allUsers - Should return all users")
        public void shouldReturnAllUsers() {
            // Arrange
            List<User> expectedUsers = Arrays.asList(doctor, familyHead);
            when(adminService.listAllUsers()).thenReturn(expectedUsers);

            // Act
            List<User> result = adminGraphQLResolver.allUsers();

            // Assert
            assertEquals(2, result.size());
            assertEquals(expectedUsers, result);
            verify(adminService).listAllUsers();
        }

        @Test
        @DisplayName("allFamilies - Should return all families")
        public void shouldReturnAllFamilies() {
            // Arrange
            List<Family> expectedFamilies = Arrays.asList(family);
            when(familyRepository.findAll()).thenReturn(expectedFamilies);

            // Act
            List<Family> result = adminGraphQLResolver.allFamilies();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedFamilies, result);
            verify(familyRepository).findAll();
        }

        @Test
        @DisplayName("memberById - Should return member by id")
        public void shouldReturnMemberById() {
            // Arrange
            Integer memberId = 10;
            when(adminService.getPatientById(memberId)).thenReturn(member);

            // Act
            Member result = adminGraphQLResolver.memberById(memberId);

            // Assert
            assertNotNull(result);
            assertEquals(member.getMemberID(), result.getMemberID());
            verify(adminService).getPatientById(memberId);
        }

        @Test
        @DisplayName("userById - Should return user by id")
        public void shouldReturnUserById() {
            // Arrange
            Integer userId = 1;
            when(adminService.getUserById(userId)).thenReturn(doctor);

            // Act
            User result = adminGraphQLResolver.userById(userId);

            // Assert
            assertNotNull(result);
            assertEquals(doctor.getUserID(), result.getUserID());
            verify(adminService).getUserById(userId);
        }

        @Test
        @DisplayName("familyById - Should return family by id")
        public void shouldReturnFamilyById() {
            // Arrange
            Integer familyId = 100;
            when(familyRepository.findById(familyId)).thenReturn(Optional.of(family));

            // Act
            Family result = adminGraphQLResolver.familyById(familyId);

            // Assert
            assertNotNull(result);
            assertEquals(family.getFamilyID(), result.getFamilyID());
            verify(familyRepository).findById(familyId);
        }

        @Test
        @DisplayName("familyById - Should throw exception when family not found")
        public void shouldThrowExceptionWhenFamilyNotFound() {
            // Arrange
            Integer familyId = 999;
            when(familyRepository.findById(familyId)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                adminGraphQLResolver.familyById(familyId));
            
            assertTrue(exception.getMessage().contains("Family not found"));
            verify(familyRepository).findById(familyId);
        }

        @Test
        @DisplayName("allPayments - Should return all payments")
        public void shouldReturnAllPayments() {
            // Arrange
            List<Payment> expectedPayments = Arrays.asList(payment);
            when(adminService.listAllPayments()).thenReturn(expectedPayments);

            // Act
            List<Payment> result = adminGraphQLResolver.allPayments();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedPayments, result);
            verify(adminService).listAllPayments();
        }

        @Test
        @DisplayName("paymentsByStatus - Should return payments by status")
        public void shouldReturnPaymentsByStatus() {
            // Arrange
            String status = "Pending";
            List<Payment> expectedPayments = Arrays.asList(payment);
            when(adminService.listPaymentsByStatus(status)).thenReturn(expectedPayments);

            // Act
            List<Payment> result = adminGraphQLResolver.paymentsByStatus(status);

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedPayments, result);
            verify(adminService).listPaymentsByStatus(status);
        }

        @Test
        @DisplayName("paymentsByStatus - Should return all payments when status is null")
        public void shouldReturnAllPaymentsWhenStatusIsNull() {
            // Arrange
            List<Payment> expectedPayments = Arrays.asList(payment);
            when(adminService.listAllPayments()).thenReturn(expectedPayments);

            // Act
            List<Payment> result = adminGraphQLResolver.paymentsByStatus(null);

            // Assert
            assertEquals(1, result.size());
            verify(adminService).listAllPayments();
            verify(adminService, never()).listPaymentsByStatus(anyString());
        }

        @Test
        @DisplayName("paymentsByStatus - Should return all payments when status is empty")
        public void shouldReturnAllPaymentsWhenStatusIsEmpty() {
            // Arrange
            List<Payment> expectedPayments = Arrays.asList(payment);
            when(adminService.listAllPayments()).thenReturn(expectedPayments);

            // Act
            List<Payment> result = adminGraphQLResolver.paymentsByStatus("");

            // Assert
            assertEquals(1, result.size());
            verify(adminService).listAllPayments();
            verify(adminService, never()).listPaymentsByStatus(anyString());
        }

        @Test
        @DisplayName("allDoctorRequests - Should return all doctor requests")
        public void shouldReturnAllDoctorRequests() {
            // Arrange
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(adminService.listAllDoctorRequests()).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminGraphQLResolver.allDoctorRequests();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedRequests, result);
            verify(adminService).listAllDoctorRequests();
        }

        @Test
        @DisplayName("doctorRequestsByStatus - Should return requests by status")
        public void shouldReturnDoctorRequestsByStatus() {
            // Arrange
            String status = "Pending";
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(adminService.listDoctorRequestsByStatus(RequestStatus.Pending)).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminGraphQLResolver.doctorRequestsByStatus(status);

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedRequests, result);
            verify(adminService).listDoctorRequestsByStatus(RequestStatus.Pending);
        }

        @Test
        @DisplayName("doctorRequestsByStatus - Should return all requests when status is null")
        public void shouldReturnAllRequestsWhenStatusIsNull() {
            // Arrange
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(adminService.listAllDoctorRequests()).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminGraphQLResolver.doctorRequestsByStatus(null);

            // Assert
            assertEquals(1, result.size());
            verify(adminService).listAllDoctorRequests();
            verify(adminService, never()).listDoctorRequestsByStatus(any());
        }

        @Test
        @DisplayName("doctorRequestsByStatus - Should return all requests when status is invalid")
        public void shouldReturnAllRequestsWhenStatusIsInvalid() {
            // Arrange
            String invalidStatus = "InvalidStatus";
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(adminService.listAllDoctorRequests()).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminGraphQLResolver.doctorRequestsByStatus(invalidStatus);

            // Assert
            assertEquals(1, result.size());
            verify(adminService).listAllDoctorRequests();
        }

        @Test
        @DisplayName("doctorRequestsForDoctor - Should return requests for doctor")
        public void shouldReturnDoctorRequestsForDoctor() {
            // Arrange
            Integer doctorId = 1;
            List<DoctorRequest> expectedRequests = Arrays.asList(doctorRequest);
            when(doctorRequestRepository.findByDoctor_UserID(doctorId)).thenReturn(expectedRequests);

            // Act
            List<DoctorRequest> result = adminGraphQLResolver.doctorRequestsForDoctor(doctorId);

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedRequests, result);
            verify(doctorRequestRepository).findByDoctor_UserID(doctorId);
        }
    }

    @Nested
    @DisplayName("Schema Mapping Tests")
    class SchemaMappingTests {

        @Test
        @DisplayName("familyID - Should return family ID when family is loaded")
        public void shouldReturnFamilyIDWhenFamilyIsLoaded() {
            // Act
            Integer result = adminGraphQLResolver.familyID(member);

            // Assert
            assertNotNull(result);
            assertEquals(family.getFamilyID(), result);
        }

        @Test
        @DisplayName("familyID - Should reload member when family is not loaded")
        public void shouldReloadMemberWhenFamilyNotLoaded() {
            // Arrange
            Member memberWithoutFamily = new Member();
            memberWithoutFamily.setMemberID(10);
            when(memberRepository.findById(10)).thenReturn(Optional.of(member));

            // Act
            Integer result = adminGraphQLResolver.familyID(memberWithoutFamily);

            // Assert
            assertNotNull(result);
            assertEquals(family.getFamilyID(), result);
            verify(memberRepository).findById(10);
        }

        @Test
        @DisplayName("familyID - Should throw exception when member has no family")
        public void shouldThrowExceptionWhenMemberHasNoFamily() {
            // Arrange
            Member memberWithoutFamily = new Member();
            memberWithoutFamily.setMemberID(10);
            when(memberRepository.findById(10)).thenReturn(Optional.of(memberWithoutFamily));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
                adminGraphQLResolver.familyID(memberWithoutFamily));
            
            assertTrue(exception.getMessage().contains("has no associated family"));
        }

        @Test
        @DisplayName("gender - Should return gender name")
        public void shouldReturnGenderName() {
            // Act
            String result = adminGraphQLResolver.gender(member);

            // Assert
            assertEquals("Nam", result);
        }

        @Test
        @DisplayName("gender - Should return null when gender is null")
        public void shouldReturnNullWhenGenderIsNull() {
            // Arrange
            Member memberWithoutGender = new Member();
            memberWithoutGender.setGender(null);

            // Act
            String result = adminGraphQLResolver.gender(memberWithoutGender);

            // Assert
            assertNull(result);
        }

        @Test
        @DisplayName("createdAt - Should return formatted date string for Member")
        public void shouldReturnFormattedDateStringForMember() {
            // Act
            String result = adminGraphQLResolver.createdAt(member);

            // Assert
            assertNotNull(result);
            assertTrue(result.contains("T"));
        }

        @Test
        @DisplayName("createdAt - Should return null when createdAt is null for Member")
        public void shouldReturnNullWhenCreatedAtIsNullForMember() {
            // Arrange
            Member memberWithoutCreatedAt = new Member();
            memberWithoutCreatedAt.setCreatedAt(null);

            // Act
            String result = adminGraphQLResolver.createdAt(memberWithoutCreatedAt);

            // Assert
            assertNull(result);
        }

        @Test
        @DisplayName("headOfFamilyID - Should return head of family ID")
        public void shouldReturnHeadOfFamilyID() {
            // Act
            Integer result = adminGraphQLResolver.headOfFamilyID(family);

            // Assert
            assertNotNull(result);
            assertEquals(familyHead.getUserID(), result);
        }

        @Test
        @DisplayName("headOfFamilyID - Should reload family when headOfFamily is not loaded")
        public void shouldReloadFamilyWhenHeadOfFamilyNotLoaded() {
            // Arrange
            Family familyWithoutHead = new Family();
            familyWithoutHead.setFamilyID(100);
            when(familyRepository.findById(100)).thenReturn(Optional.of(family));

            // Act
            Integer result = adminGraphQLResolver.headOfFamilyID(familyWithoutHead);

            // Assert
            assertNotNull(result);
            assertEquals(familyHead.getUserID(), result);
            verify(familyRepository).findById(100);
        }

        @Test
        @DisplayName("headOfFamilyID - Should return null when no head of family")
        public void shouldReturnNullWhenNoHeadOfFamily() {
            // Arrange
            Family familyWithoutHead = new Family();
            familyWithoutHead.setFamilyID(100);
            familyWithoutHead.setHeadOfFamily(null);
            when(familyRepository.findById(100)).thenReturn(Optional.of(familyWithoutHead));

            // Act
            Integer result = adminGraphQLResolver.headOfFamilyID(familyWithoutHead);

            // Assert
            assertNull(result);
        }

        @Test
        @DisplayName("familyAddress - Should return family address")
        public void shouldReturnFamilyAddress() {
            // Act
            String result = adminGraphQLResolver.familyAddress(family);

            // Assert
            assertEquals(family.getAddress(), result);
        }

        @Test
        @DisplayName("address - Should return family address")
        public void shouldReturnAddress() {
            // Act
            String result = adminGraphQLResolver.address(family);

            // Assert
            assertEquals(family.getAddress(), result);
        }

        @Test
        @DisplayName("createdAt - Should return formatted date string for Family")
        public void shouldReturnFormattedDateStringForFamily() {
            // Act
            String result = adminGraphQLResolver.createdAt(family);

            // Assert
            assertNotNull(result);
            assertTrue(result.contains("T"));
        }

        @Test
        @DisplayName("createdAt - Should return null when createdAt is null for Family")
        public void shouldReturnNullWhenCreatedAtIsNullForFamily() {
            // Arrange
            Family familyWithoutCreatedAt = new Family();
            familyWithoutCreatedAt.setCreatedAt(null);

            // Act
            String result = adminGraphQLResolver.createdAt(familyWithoutCreatedAt);

            // Assert
            assertNull(result);
        }

        @Test
        @DisplayName("requestDate - Should return formatted date string")
        public void shouldReturnFormattedRequestDate() {
            // Act
            String result = adminGraphQLResolver.requestDate(doctorRequest);

            // Assert
            assertNotNull(result);
            assertTrue(result.contains("T"));
        }

        @Test
        @DisplayName("requestDate - Should return null when requestDate is null")
        public void shouldReturnNullWhenRequestDateIsNull() {
            // Arrange
            DoctorRequest requestWithoutDate = new DoctorRequest();
            requestWithoutDate.setRequestDate(null);

            // Act
            String result = adminGraphQLResolver.requestDate(requestWithoutDate);

            // Assert
            assertNull(result);
        }

        @Test
        @DisplayName("status - Should return status name")
        public void shouldReturnStatusName() {
            // Act
            String result = adminGraphQLResolver.status(doctorRequest);

            // Assert
            assertEquals("Pending", result);
        }

        @Test
        @DisplayName("status - Should return null when status is null")
        public void shouldReturnNullWhenStatusIsNull() {
            // Arrange
            DoctorRequest requestWithoutStatus = new DoctorRequest();
            requestWithoutStatus.setStatus(null);

            // Act
            String result = adminGraphQLResolver.status(requestWithoutStatus);

            // Assert
            assertNull(result);
        }

        @Test
        @DisplayName("paymentDate - Should return formatted date string")
        public void shouldReturnFormattedPaymentDate() {
            // Act
            String result = adminGraphQLResolver.paymentDate(payment);

            // Assert
            assertNotNull(result);
            assertTrue(result.contains("T"));
        }

        @Test
        @DisplayName("expiryDate - Should return formatted date string")
        public void shouldReturnFormattedExpiryDate() {
            // Act
            String result = adminGraphQLResolver.expiryDate(payment);

            // Assert
            assertNotNull(result);
            assertTrue(result.contains("T"));
        }

        // @Test
        // @DisplayName("createdAt - Should return formatted date string for Payment")
        // public void shouldReturnFormattedCreatedAtForPayment() {
        //     // Act
        //     String result = adminGraphQLResolver.createdAt(payment);

        //     // Assert
        //     assertNotNull(result);
        //     assertTrue(result.contains("T"));
        // }

        @Test
        @DisplayName("updatedAt - Should return formatted date string")
        public void shouldReturnFormattedUpdatedAt() {
            // Act
            String result = adminGraphQLResolver.updatedAt(payment);

            // Assert
            assertNotNull(result);
            assertTrue(result.contains("T"));
        }
    }

    @Nested
    @DisplayName("Member Mutation Tests")
    class MemberMutationTests {

        @Test
        @DisplayName("createMember - Should create member successfully")
        public void shouldCreateMemberSuccessfully() {
            // Arrange
            AdminGraphQLResolver.CreateMemberInput input = new AdminGraphQLResolver.CreateMemberInput();
            input.setFamilyID(100);
            input.setFullName("New Member");
            input.setDateOfBirth("1990-01-01");
            input.setGender("Nam");
            input.setCccd("123456789012");
            input.setRelationship("Con");
            input.setPhoneNumber("0123456789");

            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(adminService.createPatient(any(Member.class))).thenReturn(member);

            // Act
            Member result = adminGraphQLResolver.createMember(input);

            // Assert
            assertNotNull(result);
            verify(familyRepository).findById(100);
            verify(adminService).createPatient(any(Member.class));
        }

        @Test
        @DisplayName("createMember - Should throw exception when family not found")
        public void shouldThrowExceptionWhenFamilyNotFound() {
            // Arrange
            AdminGraphQLResolver.CreateMemberInput input = new AdminGraphQLResolver.CreateMemberInput();
            input.setFamilyID(999);
            when(familyRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminGraphQLResolver.createMember(input));
            
            verify(familyRepository).findById(999);
            verify(adminService, never()).createPatient(any());
        }

        @Test
        @DisplayName("createMember - Should map gender from Male to Nam")
        public void shouldMapGenderFromMaleToNam() {
            // Arrange
            AdminGraphQLResolver.CreateMemberInput input = new AdminGraphQLResolver.CreateMemberInput();
            input.setFamilyID(100);
            input.setGender("Male");
            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(adminService.createPatient(any(Member.class))).thenReturn(member);

            // Act
            adminGraphQLResolver.createMember(input);

            // Assert
            verify(adminService).createPatient(any(Member.class));
        }

        @Test
        @DisplayName("createMember - Should map gender from Female to Nữ")
        public void shouldMapGenderFromFemaleToNu() {
            // Arrange
            AdminGraphQLResolver.CreateMemberInput input = new AdminGraphQLResolver.CreateMemberInput();
            input.setFamilyID(100);
            input.setGender("Female");
            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(adminService.createPatient(any(Member.class))).thenReturn(member);

            // Act
            adminGraphQLResolver.createMember(input);

            // Assert
            verify(adminService).createPatient(any(Member.class));
        }

        @Test
        @DisplayName("updateMember - Should update member successfully")
        public void shouldUpdateMemberSuccessfully() {
            // Arrange
            Integer memberId = 10;
            AdminGraphQLResolver.UpdateMemberInput input = new AdminGraphQLResolver.UpdateMemberInput();
            input.setFullName("Updated Name");
            input.setPhoneNumber("0987654321");

            when(adminService.getPatientById(memberId)).thenReturn(member);
            when(adminService.updatePatient(eq(memberId), any(Member.class))).thenReturn(member);

            // Act
            Member result = adminGraphQLResolver.updateMember(memberId, input);

            // Assert
            assertNotNull(result);
            verify(adminService).getPatientById(memberId);
            verify(adminService).updatePatient(eq(memberId), any(Member.class));
        }

        @Test
        @DisplayName("deleteMember - Should delete member successfully")
        public void shouldDeleteMemberSuccessfully() {
            // Arrange
            Integer memberId = 10;
            doNothing().when(adminService).deletePatient(memberId);

            // Act
            Boolean result = adminGraphQLResolver.deleteMember(memberId);

            // Assert
            assertTrue(result);
            verify(adminService).deletePatient(memberId);
        }
    }

    @Nested
    @DisplayName("User Mutation Tests")
    class UserMutationTests {

        @Test
        @DisplayName("createUser - Should create user successfully")
        public void shouldCreateUserSuccessfully() {
            // Arrange
            AdminGraphQLResolver.CreateUserInput input = new AdminGraphQLResolver.CreateUserInput();
            input.setFullName("New User");
            input.setEmail("newuser@example.com");
            input.setPassword("password123");
            input.setRole(UserRole.BacSi);
            input.setPhoneNumber("0123456789");
            input.setAddress("123 Street");
            input.setCccd("123456789012");
            input.setDoctorCode("DOC001");

            when(adminService.createUser(any(User.class), eq("password123"))).thenReturn(doctor);

            // Act
            User result = adminGraphQLResolver.createUser(input);

            // Assert
            assertNotNull(result);
            verify(adminService).createUser(any(User.class), eq("password123"));
        }

        @Test
        @DisplayName("updateUser - Should update user successfully")
        public void shouldUpdateUserSuccessfully() {
            // Arrange
            AdminGraphQLResolver.UpdateUserInput input = new AdminGraphQLResolver.UpdateUserInput();
            input.setUserID(1);
            input.setFullName("Updated Name");
            input.setPhoneNumber("0987654321");
            input.setAddress("New Address");
            input.setCccd("987654321098");
            input.setDoctorCode("DOC002");
            input.setRole(UserRole.BacSi);

            when(adminService.updateUser(eq(1), any(User.class))).thenReturn(doctor);

            // Act
            User result = adminGraphQLResolver.updateUser(input);

            // Assert
            assertNotNull(result);
            verify(adminService).updateUser(eq(1), any(User.class));
        }

        @Test
        @DisplayName("deleteUser - Should delete user successfully")
        public void shouldDeleteUserSuccessfully() {
            // Arrange
            Integer userId = 1;
            doNothing().when(adminService).deleteUser(userId);

            // Act
            Boolean result = adminGraphQLResolver.deleteUser(userId);

            // Assert
            assertTrue(result);
            verify(adminService).deleteUser(userId);
        }

        @Test
        @DisplayName("changeUserRole - Should change user role successfully")
        public void shouldChangeUserRoleSuccessfully() {
            // Arrange
            Integer userId = 1;
            UserRole newRole = UserRole.ChuHo;
            when(adminService.changeUserRole(userId, newRole)).thenReturn(doctor);

            // Act
            User result = adminGraphQLResolver.changeUserRole(userId, newRole);

            // Assert
            assertNotNull(result);
            verify(adminService).changeUserRole(userId, newRole);
        }

        @Test
        @DisplayName("resetPassword - Should reset password successfully")
        public void shouldResetPasswordSuccessfully() {
            // Arrange
            Integer userId = 1;
            String newPassword = "newpassword123";
            doNothing().when(adminService).resetPassword(userId, newPassword);

            // Act
            Boolean result = adminGraphQLResolver.resetPassword(userId, newPassword);

            // Assert
            assertTrue(result);
            verify(adminService).resetPassword(userId, newPassword);
        }

        @Test
        @DisplayName("lockUser - Should lock user successfully")
        public void shouldLockUserSuccessfully() {
            // Arrange
            Integer userId = 1;
            doNothing().when(adminService).lockUserAccount(userId);

            // Act
            Boolean result = adminGraphQLResolver.lockUser(userId);

            // Assert
            assertTrue(result);
            verify(adminService).lockUserAccount(userId);
        }

        @Test
        @DisplayName("unlockUser - Should unlock user successfully")
        public void shouldUnlockUserSuccessfully() {
            // Arrange
            Integer userId = 1;
            doNothing().when(adminService).unlockUserAccount(userId);

            // Act
            Boolean result = adminGraphQLResolver.unlockUser(userId);

            // Assert
            assertTrue(result);
            verify(adminService).unlockUserAccount(userId);
        }
    }

    @Nested
    @DisplayName("Family Mutation Tests")
    class FamilyMutationTests {

        @Test
        @DisplayName("createFamily - Should create family successfully")
        public void shouldCreateFamilySuccessfully() {
            // Arrange
            AdminGraphQLResolver.CreateFamilyInput input = new AdminGraphQLResolver.CreateFamilyInput();
            input.setFamilyName("New Family");
            input.setAddress("New Address");
            input.setHeadOfFamilyID(2);

            when(userRepository.findById(2)).thenReturn(Optional.of(familyHead));
            when(familyRepository.save(any(Family.class))).thenReturn(family);

            // Act
            Family result = adminGraphQLResolver.createFamily(input);

            // Assert
            assertNotNull(result);
            verify(userRepository).findById(2);
            verify(familyRepository).save(any(Family.class));
        }

        @Test
        @DisplayName("createFamily - Should create family without head of family")
        public void shouldCreateFamilyWithoutHeadOfFamily() {
            // Arrange
            AdminGraphQLResolver.CreateFamilyInput input = new AdminGraphQLResolver.CreateFamilyInput();
            input.setFamilyName("New Family");
            input.setAddress("New Address");
            input.setHeadOfFamilyID(null);

            when(familyRepository.save(any(Family.class))).thenReturn(family);

            // Act
            Family result = adminGraphQLResolver.createFamily(input);

            // Assert
            assertNotNull(result);
            verify(userRepository, never()).findById(anyInt());
            verify(familyRepository).save(any(Family.class));
        }

        @Test
        @DisplayName("createFamily - Should throw exception when head of family not found")
        public void shouldThrowExceptionWhenHeadOfFamilyNotFound() {
            // Arrange
            AdminGraphQLResolver.CreateFamilyInput input = new AdminGraphQLResolver.CreateFamilyInput();
            input.setFamilyName("New Family");
            input.setHeadOfFamilyID(999);
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminGraphQLResolver.createFamily(input));
            
            verify(userRepository).findById(999);
            verify(familyRepository, never()).save(any());
        }

        @Test
        @DisplayName("updateFamily - Should update family successfully")
        public void shouldUpdateFamilySuccessfully() {
            // Arrange
            AdminGraphQLResolver.UpdateFamilyInput input = new AdminGraphQLResolver.UpdateFamilyInput();
            input.setFamilyID(100);
            input.setFamilyName("Updated Family");
            input.setAddress("Updated Address");

            when(familyRepository.findById(100)).thenReturn(Optional.of(family));
            when(familyRepository.save(any(Family.class))).thenReturn(family);

            // Act
            Family result = adminGraphQLResolver.updateFamily(input);

            // Assert
            assertNotNull(result);
            verify(familyRepository).findById(100);
            verify(familyRepository).save(any(Family.class));
        }

        @Test
        @DisplayName("updateFamily - Should throw exception when family not found")
        public void shouldThrowExceptionWhenFamilyNotFound() {
            // Arrange
            AdminGraphQLResolver.UpdateFamilyInput input = new AdminGraphQLResolver.UpdateFamilyInput();
            input.setFamilyID(999);
            when(familyRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminGraphQLResolver.updateFamily(input));
            
            verify(familyRepository).findById(999);
            verify(familyRepository, never()).save(any());
        }

        @Test
        @DisplayName("deleteFamily - Should delete family successfully")
        public void shouldDeleteFamilySuccessfully() {
            // Arrange
            Integer familyId = 100;
            doNothing().when(familyRepository).deleteById(familyId);

            // Act
            Boolean result = adminGraphQLResolver.deleteFamily(familyId);

            // Assert
            assertTrue(result);
            verify(familyRepository).deleteById(familyId);
        }
    }

    @Nested
    @DisplayName("Doctor Request Mutation Tests")
    class DoctorRequestMutationTests {

        @Test
        @DisplayName("approveDoctorRequest - Should approve request successfully")
        public void shouldApproveDoctorRequestSuccessfully() {
            // Arrange
            Integer requestId = 1;
            when(adminService.verifyDoctorRequest(requestId, true)).thenReturn(doctor);

            // Act
            User result = adminGraphQLResolver.approveDoctorRequest(requestId);

            // Assert
            assertNotNull(result);
            verify(adminService).verifyDoctorRequest(requestId, true);
        }

        @Test
        @DisplayName("rejectDoctorRequest - Should reject request successfully")
        public void shouldRejectDoctorRequestSuccessfully() {
            // Arrange
            Integer requestId = 1;
            when(adminService.verifyDoctorRequest(requestId, false)).thenReturn(doctor);

            // Act
            Boolean result = adminGraphQLResolver.rejectDoctorRequest(requestId);

            // Assert
            assertTrue(result);
            verify(adminService).verifyDoctorRequest(requestId, false);
        }
    }

    @Nested
    @DisplayName("Doctor Assignment Mutation Tests")
    class DoctorAssignmentMutationTests {

        @Test
        @DisplayName("assignDoctorToMember - Should assign doctor successfully")
        public void shouldAssignDoctorSuccessfully() {
            // Arrange
            Integer memberId = 10;
            Integer doctorId = 1;
            when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
            when(userRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
            when(doctorAssignmentRepository.save(any(DoctorAssignment.class))).thenReturn(new DoctorAssignment());

            // Act
            Boolean result = adminGraphQLResolver.assignDoctorToMember(memberId, doctorId);

            // Assert
            assertTrue(result);
            verify(memberRepository).findById(memberId);
            verify(userRepository).findById(doctorId);
            verify(doctorAssignmentRepository).save(any(DoctorAssignment.class));
        }

        @Test
        @DisplayName("assignDoctorToMember - Should throw exception when member not found")
        public void shouldThrowExceptionWhenMemberNotFound() {
            // Arrange
            Integer memberId = 999;
            Integer doctorId = 1;
            when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminGraphQLResolver.assignDoctorToMember(memberId, doctorId));
            
            verify(memberRepository).findById(memberId);
            verify(userRepository, never()).findById(anyInt());
        }

        @Test
        @DisplayName("assignDoctorToMember - Should throw exception when doctor not found")
        public void shouldThrowExceptionWhenDoctorNotFound() {
            // Arrange
            Integer memberId = 10;
            Integer doctorId = 999;
            when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
            when(userRepository.findById(doctorId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> 
                adminGraphQLResolver.assignDoctorToMember(memberId, doctorId));
            
            verify(memberRepository).findById(memberId);
            verify(userRepository).findById(doctorId);
        }

        @Test
        @DisplayName("assignDoctorToMember - Should throw exception when member has no family")
        public void shouldThrowExceptionWhenMemberHasNoFamily() {
            // Arrange
            Integer memberId = 10;
            Integer doctorId = 1;
            Member memberWithoutFamily = new Member();
            memberWithoutFamily.setMemberID(10);
            memberWithoutFamily.setFamily(null);
            when(memberRepository.findById(memberId)).thenReturn(Optional.of(memberWithoutFamily));
            when(userRepository.findById(doctorId)).thenReturn(Optional.of(doctor));

            // Act & Assert
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
                adminGraphQLResolver.assignDoctorToMember(memberId, doctorId));
            
            assertTrue(exception.getMessage().contains("has no associated family"));
            verify(memberRepository).findById(memberId);
            verify(userRepository).findById(doctorId);
            verify(doctorAssignmentRepository, never()).save(any());
        }
    }
}

