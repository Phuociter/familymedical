package com.example.famMedical.service;

import static org.junit.jupiter.api.Assertions.*;
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

import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MedicalRecordRepository;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorService Tests")
public class DoctorServiceTest {

    @Mock
    private FamilyRepository familyRepo;

    @Mock
    private MemberRepository memberRepo;

    @Mock
    private MedicalRecordRepository medicalRecordRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private DoctorAssignmentRepository assignmentRepo;

    @InjectMocks
    private DoctorService doctorService;

    private User doctor;
    private User nonDoctor;
    private Family family1;
    private Family family2;
    private Member member1;
    private Member member2;
    private MedicalRecord record1;
    private MedicalRecord record2;

    @BeforeEach
    public void setUp() {
        // Setup doctor user
        doctor = new User();
        doctor.setUserID(1);
        doctor.setEmail("doctor@example.com");
        doctor.setRole(UserRole.BacSi);

        // Setup non-doctor user
        nonDoctor = new User();
        nonDoctor.setUserID(2);
        nonDoctor.setEmail("user@example.com");
        nonDoctor.setRole(UserRole.ChuHo);

        // Setup families
        family1 = new Family();
        family1.setFamilyID(100);
        family1.setFamilyName("Family One");

        family2 = new Family();
        family2.setFamilyID(101);
        family2.setFamilyName("Family Two");

        // Setup members
        member1 = new Member();
        member1.setMemberID(10);
        member1.setFullName("Member One");
        member1.setFamily(family1);

        member2 = new Member();
        member2.setMemberID(11);
        member2.setFullName("Member Two");
        member2.setFamily(family1);

        // Setup medical records
        record1 = new MedicalRecord();
        record1.setRecordID(1000);
        record1.setMember(member1);

        record2 = new MedicalRecord();
        record2.setRecordID(1001);
        record2.setMember(member1);
    }

    @Nested
    @DisplayName("getDoctorAssignedFamilies tests")
    class GetDoctorAssignedFamiliesTests {

        @Test
        @DisplayName("Should return families for valid doctor without search")
        public void shouldReturnFamiliesForValidDoctorWithoutSearch() {
            // Arrange
            List<Family> expectedFamilies = Arrays.asList(family1, family2);
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(familyRepo.findAssignedFamiliesByDoctorId(doctor.getUserID())).thenReturn(expectedFamilies);

            // Act
            List<Family> result = doctorService.getDoctorAssignedFamilies(doctor.getUserID(), null);

            // Assert
            assertEquals(2, result.size());
            assertEquals(expectedFamilies, result);
            verify(userRepo).findById(doctor.getUserID());
            verify(familyRepo).findAssignedFamiliesByDoctorId(doctor.getUserID());
            verify(familyRepo, never()).searchAssignedFamiliesByDoctorId(anyInt(), anyString());
        }

        @Test
        @DisplayName("Should return filtered families when search term is provided")
        public void shouldReturnFilteredFamiliesWithSearch() {
            // Arrange
            String searchTerm = "Smith";
            List<Family> expectedFamilies = Arrays.asList(family1);
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(familyRepo.searchAssignedFamiliesByDoctorId(doctor.getUserID(), searchTerm))
                .thenReturn(expectedFamilies);

            // Act
            List<Family> result = doctorService.getDoctorAssignedFamilies(doctor.getUserID(), searchTerm);

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedFamilies, result);
            verify(userRepo).findById(doctor.getUserID());
            verify(familyRepo).searchAssignedFamiliesByDoctorId(doctor.getUserID(), searchTerm);
            verify(familyRepo, never()).findAssignedFamiliesByDoctorId(anyInt());
        }

        @Test
        @DisplayName("Should ignore empty search strings")
        public void shouldIgnoreEmptySearchString() {
            // Arrange
            List<Family> expectedFamilies = Arrays.asList(family1, family2);
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(familyRepo.findAssignedFamiliesByDoctorId(doctor.getUserID())).thenReturn(expectedFamilies);

            // Act
            List<Family> result = doctorService.getDoctorAssignedFamilies(doctor.getUserID(), "   ");

            // Assert
            assertEquals(2, result.size());
            verify(familyRepo, never()).searchAssignedFamiliesByDoctorId(anyInt(), anyString());
            verify(familyRepo).findAssignedFamiliesByDoctorId(doctor.getUserID());
        }

        @Test
        @DisplayName("Should throw NotFoundException when doctor does not exist")
        public void shouldThrowNotFoundExceptionWhenDoctorNotFound() {
            // Arrange
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                doctorService.getDoctorAssignedFamilies(doctor.getUserID(), null));
            
            verify(userRepo).findById(doctor.getUserID());
            verify(familyRepo, never()).findAssignedFamiliesByDoctorId(anyInt());
        }

        @Test
        @DisplayName("Should throw AuthException when user is not a doctor")
        public void shouldThrowAuthExceptionWhenUserIsNotDoctor() {
            // Arrange
            when(userRepo.findById(nonDoctor.getUserID())).thenReturn(Optional.of(nonDoctor));

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () -> 
                doctorService.getDoctorAssignedFamilies(nonDoctor.getUserID(), null));
            
            assertEquals("User không phải là doctor", exception.getMessage());
            verify(userRepo).findById(nonDoctor.getUserID());
            verify(familyRepo, never()).findAssignedFamiliesByDoctorId(anyInt());
        }

        @Test
        @DisplayName("Should return empty list when doctor has no assigned families")
        public void shouldReturnEmptyListWhenNofamilies() {
            // Arrange
            List<Family> emptyList = Arrays.asList();
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(familyRepo.findAssignedFamiliesByDoctorId(doctor.getUserID())).thenReturn(emptyList);

            // Act
            List<Family> result = doctorService.getDoctorAssignedFamilies(doctor.getUserID(), null);

            // Assert
            assertTrue(result.isEmpty());
            assertEquals(0, result.size());
        }
    }

    @Nested
    @DisplayName("getFamilyMembers tests")
    class GetFamilyMembersTests {

        @Test
        @DisplayName("Should return family members when doctor has access")
        public void shouldReturnFamilyMembersWhenDoctorHasAccess() {
            // Arrange
            List<Member> expectedMembers = Arrays.asList(member1, member2);
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(assignmentRepo.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), family1.getFamilyID(), AssignmentStatus.ACTIVE))
                .thenReturn(true);
            when(memberRepo.findByFamily_FamilyID(family1.getFamilyID())).thenReturn(expectedMembers);

            // Act
            List<Member> result = doctorService.getFamilyMembers(doctor.getUserID(), family1.getFamilyID());

            // Assert
            assertEquals(2, result.size());
            assertEquals(expectedMembers, result);
            verify(userRepo).findById(doctor.getUserID());
            verify(assignmentRepo).existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), family1.getFamilyID(), AssignmentStatus.ACTIVE);
            verify(memberRepo).findByFamily_FamilyID(family1.getFamilyID());
        }

        @Test
        @DisplayName("Should throw NotFoundException when doctor does not exist")
        public void shouldThrowNotFoundExceptionWhenDoctorNotExists() {
            // Arrange
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                doctorService.getFamilyMembers(doctor.getUserID(), family1.getFamilyID()));
            
            verify(userRepo).findById(doctor.getUserID());
            verify(assignmentRepo, never()).existsByDoctorUserIDAndFamilyFamilyIDAndStatus(anyInt(), anyInt(), any());
        }

        @Test
        @DisplayName("Should throw AuthException when user is not a doctor")
        public void shouldThrowAuthExceptionWhenNotDoctor() {
            // Arrange
            when(userRepo.findById(nonDoctor.getUserID())).thenReturn(Optional.of(nonDoctor));

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () -> 
                doctorService.getFamilyMembers(nonDoctor.getUserID(), family1.getFamilyID()));
            
            assertEquals("User không phải là doctor", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw AuthException when doctor does not have access to family")
        public void shouldThrowAuthExceptionWhenNoAccess() {
            // Arrange
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(assignmentRepo.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), family1.getFamilyID(), AssignmentStatus.ACTIVE))
                .thenReturn(false);

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () -> 
                doctorService.getFamilyMembers(doctor.getUserID(), family1.getFamilyID()));
            
            assertEquals("Bạn không có quyền truy cập gia đình này", exception.getMessage());
            verify(memberRepo, never()).findByFamily_FamilyID(anyInt());
        }

        @Test
        @DisplayName("Should return empty list when family has no members")
        public void shouldReturnEmptyListWhenNoMembers() {
            // Arrange
            List<Member> emptyList = Arrays.asList();
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(assignmentRepo.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), family1.getFamilyID(), AssignmentStatus.ACTIVE))
                .thenReturn(true);
            when(memberRepo.findByFamily_FamilyID(family1.getFamilyID())).thenReturn(emptyList);

            // Act
            List<Member> result = doctorService.getFamilyMembers(doctor.getUserID(), family1.getFamilyID());

            // Assert
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("getMemberMedicalRecords tests")
    class GetMemberMedicalRecordsTests {

        @Test
        @DisplayName("Should return medical records for member when doctor has access")
        public void shouldReturnMedicalRecordsWhenDoctorHasAccess() {
            // Arrange
            List<MedicalRecord> expectedRecords = Arrays.asList(record1, record2);
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(memberRepo.findById(member1.getMemberID())).thenReturn(Optional.of(member1));
            when(assignmentRepo.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), family1.getFamilyID(), AssignmentStatus.ACTIVE))
                .thenReturn(true);
            when(medicalRecordRepo.findByMemberMemberID(member1.getMemberID())).thenReturn(expectedRecords);

            // Act
            List<MedicalRecord> result = doctorService.getMemberMedicalRecords(doctor.getUserID(), member1.getMemberID());

            // Assert
            assertEquals(2, result.size());
            assertEquals(expectedRecords, result);
            verify(userRepo).findById(doctor.getUserID());
            verify(memberRepo).findById(member1.getMemberID());
            verify(medicalRecordRepo).findByMemberMemberID(member1.getMemberID());
        }

        @Test
        @DisplayName("Should throw NotFoundException when doctor does not exist")
        public void shouldThrowNotFoundExceptionWhenDoctorNotExists() {
            // Arrange
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () -> 
                doctorService.getMemberMedicalRecords(doctor.getUserID(), member1.getMemberID()));
            
            verify(memberRepo, never()).findById(anyInt());
        }

        @Test
        @DisplayName("Should throw AuthException when user is not a doctor")
        public void shouldThrowAuthExceptionWhenNotDoctor() {
            // Arrange
            when(userRepo.findById(nonDoctor.getUserID())).thenReturn(Optional.of(nonDoctor));

            // Act & Assert
            assertThrows(AuthException.class, () -> 
                doctorService.getMemberMedicalRecords(nonDoctor.getUserID(), member1.getMemberID()));
        }

        @Test
        @DisplayName("Should throw NotFoundException when member does not exist")
        public void shouldThrowNotFoundExceptionWhenMemberNotExists() {
            // Arrange
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(memberRepo.findById(member1.getMemberID())).thenReturn(Optional.empty());

            // Act & Assert
            NotFoundException exception = assertThrows(NotFoundException.class, () -> 
                doctorService.getMemberMedicalRecords(doctor.getUserID(), member1.getMemberID()));
            
            assertEquals("Member không tồn tại", exception.getMessage());
            verify(medicalRecordRepo, never()).findByMemberMemberID(anyInt());
        }

        @Test
        @DisplayName("Should throw AuthException when doctor does not have access to member's family")
        public void shouldThrowAuthExceptionWhenNoAccessToFamily() {
            // Arrange
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(memberRepo.findById(member1.getMemberID())).thenReturn(Optional.of(member1));
            when(assignmentRepo.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), family1.getFamilyID(), AssignmentStatus.ACTIVE))
                .thenReturn(false);

            // Act & Assert
            AuthException exception = assertThrows(AuthException.class, () -> 
                doctorService.getMemberMedicalRecords(doctor.getUserID(), member1.getMemberID()));
            
            assertEquals("Bạn không có quyền truy cập gia đình này", exception.getMessage());
            verify(medicalRecordRepo, never()).findByMemberMemberID(anyInt());
        }

        @Test
        @DisplayName("Should return empty list when member has no medical records")
        public void shouldReturnEmptyListWhenNoRecords() {
            // Arrange
            List<MedicalRecord> emptyList = Arrays.asList();
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(memberRepo.findById(member1.getMemberID())).thenReturn(Optional.of(member1));
            when(assignmentRepo.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), family1.getFamilyID(), AssignmentStatus.ACTIVE))
                .thenReturn(true);
            when(medicalRecordRepo.findByMemberMemberID(member1.getMemberID())).thenReturn(emptyList);

            // Act
            List<MedicalRecord> result = doctorService.getMemberMedicalRecords(doctor.getUserID(), member1.getMemberID());

            // Assert
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Should return single medical record correctly")
        public void shouldReturnSingleMedicalRecord() {
            // Arrange
            List<MedicalRecord> expectedRecords = Arrays.asList(record1);
            when(userRepo.findById(doctor.getUserID())).thenReturn(Optional.of(doctor));
            when(memberRepo.findById(member1.getMemberID())).thenReturn(Optional.of(member1));
            when(assignmentRepo.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctor.getUserID(), family1.getFamilyID(), AssignmentStatus.ACTIVE))
                .thenReturn(true);
            when(medicalRecordRepo.findByMemberMemberID(member1.getMemberID())).thenReturn(expectedRecords);

            // Act
            List<MedicalRecord> result = doctorService.getMemberMedicalRecords(doctor.getUserID(), member1.getMemberID());

            // Assert
            assertEquals(1, result.size());
            assertEquals(record1.getRecordID(), result.get(0).getRecordID());
        }
    }
}
