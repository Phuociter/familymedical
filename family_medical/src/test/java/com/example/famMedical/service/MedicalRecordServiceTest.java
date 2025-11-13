package com.example.famMedical.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.MedicalRecordRepository;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class MedicalRecordServiceTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private DoctorAssignmentRepository doctorAssignmentRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private MedicalRecordService medicalRecordService;

    private User doctorUser;
    private User familyHeadUser;
    private User adminUser;
    private User unauthorizedUser;
    private Family family;
    private Member member;
    private MedicalRecord record;

    @BeforeEach
    public void setUp() {
        // Setup users
        doctorUser = new User();
        doctorUser.setUserID(1);
        doctorUser.setEmail("doctor@example.com");
        doctorUser.setRole(UserRole.BacSi);

        familyHeadUser = new User();
        familyHeadUser.setUserID(2);
        familyHeadUser.setEmail("head@example.com");
        familyHeadUser.setRole(UserRole.ChuHo);

        adminUser = new User();
        adminUser.setUserID(3);
        adminUser.setEmail("admin@example.com");
        adminUser.setRole(UserRole.Admin);

        unauthorizedUser = new User();
        unauthorizedUser.setUserID(4);
        unauthorizedUser.setEmail("other@example.com");
        unauthorizedUser.setRole(UserRole.ChuHo);

        // Setup family
        family = new Family();
        family.setFamilyID(100);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHeadUser);

        // Setup member
        member = new Member();
        member.setMemberID(1);
        member.setFullName("Test Member");
        member.setFamily(family);

        // Setup record
        record = new MedicalRecord();
        record.setRecordID(1);
        record.setMember(member);
        record.setFileLink("https://example.com/file.pdf");
    }

    // ============= canUserDownloadRecord tests =============

    @Test
    public void testCanUserDownloadRecord_DoctorWithActiveAssignment() {
        // Arrange
        when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
            doctorUser.getUserID(), family.getFamilyID(), AssignmentStatus.ACTIVE))
            .thenReturn(true);

        // Act
        boolean allowed = medicalRecordService.canUserDownloadRecord(doctorUser, record);

        // Assert
        assertTrue(allowed);
        verify(doctorAssignmentRepository, times(1))
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctorUser.getUserID(), family.getFamilyID(), AssignmentStatus.ACTIVE);
    }

    @Test
    public void testCanUserDownloadRecord_DoctorWithoutActiveAssignment() {
        // Arrange
        when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
            doctorUser.getUserID(), family.getFamilyID(), AssignmentStatus.ACTIVE))
            .thenReturn(false);

        // Act
        boolean allowed = medicalRecordService.canUserDownloadRecord(doctorUser, record);

        // Assert
        assertFalse(allowed);
        verify(doctorAssignmentRepository, times(1))
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
                doctorUser.getUserID(), family.getFamilyID(), AssignmentStatus.ACTIVE);
    }

    @Test
    public void testCanUserDownloadRecord_AdminAlwaysAllowed() {
        // Act
        boolean allowed = medicalRecordService.canUserDownloadRecord(adminUser, record);

        // Assert
        assertTrue(allowed);
        verify(doctorAssignmentRepository, never()).existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
            anyInt(), anyInt(), any());
    }

    @Test
    public void testCanUserDownloadRecord_FamilyHeadAllowed() {
        // Act
        boolean allowed = medicalRecordService.canUserDownloadRecord(familyHeadUser, record);

        // Assert
        assertTrue(allowed);
    }

    @Test
    public void testCanUserDownloadRecord_OtherFamilyHeadNotAllowed() {
        // Act
        boolean allowed = medicalRecordService.canUserDownloadRecord(unauthorizedUser, record);

        // Assert
        assertFalse(allowed);
    }

    @Test
    public void testCanUserDownloadRecord_FamilyHeadNotSet() {
        // Arrange
        family.setHeadOfFamily(null);

        // Act
        boolean allowed = medicalRecordService.canUserDownloadRecord(familyHeadUser, record);

        // Assert
        assertFalse(allowed);
    }

    // ============= getDownloadUrl tests =============

    @Test
    public void testGetDownloadUrl_Success_DirectURL() {
        // Arrange
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act
        String url = medicalRecordService.getDownloadUrl(familyHeadUser, 1);

        // Assert
        assertEquals("https://example.com/file.pdf", url);
        verify(medicalRecordRepository, times(1)).findById(1);
    }

    @Test
    public void testGetDownloadUrl_Success_CloudinaryURL() {
        // Arrange
        record.setFileLink("cloudinary-public-id");
        String expectedUrl = "https://res.cloudinary.com/...";
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));
        when(cloudinaryService.getDownloadUrl("cloudinary-public-id")).thenReturn(expectedUrl);

        // Act
        String url = medicalRecordService.getDownloadUrl(familyHeadUser, 1);

        // Assert
        assertEquals(expectedUrl, url);
        verify(cloudinaryService, times(1)).getDownloadUrl("cloudinary-public-id");
    }

    @Test
    public void testGetDownloadUrl_RecordNotFound() {
        // Arrange
        when(medicalRecordRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            medicalRecordService.getDownloadUrl(familyHeadUser, 999)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Record not found"));
    }

    @Test
    public void testGetDownloadUrl_MemberNotLinked() {
        // Arrange
        record.setMember(null);
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            medicalRecordService.getDownloadUrl(familyHeadUser, 1)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Family not found"));
    }

    @Test
    public void testGetDownloadUrl_FamilyNotLinked() {
        // Arrange
        member.setFamily(null);
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            medicalRecordService.getDownloadUrl(familyHeadUser, 1)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Family not found"));
    }

    @Test
    public void testGetDownloadUrl_Forbidden_UnauthorizedUser() {
        // Arrange
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            medicalRecordService.getDownloadUrl(unauthorizedUser, 1)
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Không có quyền"));
    }

    @Test
    public void testGetDownloadUrl_Forbidden_DoctorWithoutAssignment() {
        // Arrange
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));
        when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
            doctorUser.getUserID(), family.getFamilyID(), AssignmentStatus.ACTIVE))
            .thenReturn(false);

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            medicalRecordService.getDownloadUrl(doctorUser, 1)
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Không có quyền"));
    }

    @Test
    public void testGetDownloadUrl_FileNotAvailable_NullFileLink() {
        // Arrange
        record.setFileLink(null);
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            medicalRecordService.getDownloadUrl(familyHeadUser, 1)
        );
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatusCode());
        assertTrue(ex.getReason().contains("File not available"));
    }

    @Test
    public void testGetDownloadUrl_FileNotAvailable_BlankFileLink() {
        // Arrange
        record.setFileLink("   ");
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act & Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            medicalRecordService.getDownloadUrl(familyHeadUser, 1)
        );
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatusCode());
        assertTrue(ex.getReason().contains("File not available"));
    }

    @Test
    public void testGetDownloadUrl_AdminAccess_AllowedRegardless() {
        // Arrange (even with unauthorized scenario)
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act
        String url = medicalRecordService.getDownloadUrl(adminUser, 1);

        // Assert
        assertEquals("https://example.com/file.pdf", url);
        verify(doctorAssignmentRepository, never())
            .existsByDoctorUserIDAndFamilyFamilyIDAndStatus(anyInt(), anyInt(), any());
    }

    @Test
    public void testGetDownloadUrl_DoctorWithActiveAssignment_Success() {
        // Arrange
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));
        when(doctorAssignmentRepository.existsByDoctorUserIDAndFamilyFamilyIDAndStatus(
            doctorUser.getUserID(), family.getFamilyID(), AssignmentStatus.ACTIVE))
            .thenReturn(true);

        // Act
        String url = medicalRecordService.getDownloadUrl(doctorUser, 1);

        // Assert
        assertEquals("https://example.com/file.pdf", url);
    }

    @Test
    public void testGetDownloadUrl_HttpFileLink() {
        // Arrange
        record.setFileLink("http://example.com/file.pdf");
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act
        String url = medicalRecordService.getDownloadUrl(familyHeadUser, 1);

        // Assert
        assertEquals("http://example.com/file.pdf", url);
        verify(cloudinaryService, never()).getDownloadUrl(anyString());
    }
}
