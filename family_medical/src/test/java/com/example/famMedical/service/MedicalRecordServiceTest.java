package com.example.famMedical.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
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
import com.example.famMedical.dto.events.MedicalRecordCreatedEvent;
import com.example.famMedical.dto.events.MedicalRecordUpdatedEvent;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class MedicalRecordServiceTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private DoctorAssignmentRepository doctorAssignmentRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

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
        when(cloudinaryService.getSignedDownloadUrl("cloudinary-public-id")).thenReturn(expectedUrl);

        // Act
        String url = medicalRecordService.getDownloadUrl(familyHeadUser, 1);

        // Assert
        assertEquals(expectedUrl, url);
        verify(cloudinaryService, times(1)).getSignedDownloadUrl("cloudinary-public-id");
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
        verify(cloudinaryService, never()).getSignedDownloadUrl(anyString());
    }

    // ============= getAllRecords tests =============

    @Test
    public void testGetAllRecords_Success() {
        // Arrange
        MedicalRecord record2 = new MedicalRecord();
        record2.setRecordID(2);
        record2.setMember(member);
        record2.setFileLink("https://example.com/file2.pdf");

        List<MedicalRecord> expectedRecords = Arrays.asList(record, record2);
        when(medicalRecordRepository.findAll()).thenReturn(expectedRecords);

        // Act
        List<MedicalRecord> result = medicalRecordService.getAllRecords();

        // Assert
        assertEquals(2, result.size());
        assertEquals(expectedRecords, result);
        verify(medicalRecordRepository, times(1)).findAll();
    }

    @Test
    public void testGetAllRecords_EmptyList() {
        // Arrange
        when(medicalRecordRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<MedicalRecord> result = medicalRecordService.getAllRecords();

        // Assert
        assertTrue(result.isEmpty());
        verify(medicalRecordRepository, times(1)).findAll();
    }

    // ============= getRecordById tests =============

    @Test
    public void testGetRecordById_Success() {
        // Arrange
        when(medicalRecordRepository.findById(1)).thenReturn(Optional.of(record));

        // Act
        Optional<MedicalRecord> result = medicalRecordService.getRecordById(1);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(record.getRecordID(), result.get().getRecordID());
        verify(medicalRecordRepository, times(1)).findById(1);
    }

    @Test
    public void testGetRecordById_NotFound() {
        // Arrange
        when(medicalRecordRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Optional<MedicalRecord> result = medicalRecordService.getRecordById(999);

        // Assert
        assertFalse(result.isPresent());
        verify(medicalRecordRepository, times(1)).findById(999);
    }

    // ============= getRecordsByMemberId tests =============

    @Test
    public void testGetRecordsByMemberId_Success() {
        // Arrange
        MedicalRecord record2 = new MedicalRecord();
        record2.setRecordID(2);
        record2.setMember(member);
        record2.setFileLink("https://example.com/file2.pdf");

        List<MedicalRecord> expectedRecords = Arrays.asList(record, record2);
        when(medicalRecordRepository.findByMember_MemberID(1)).thenReturn(expectedRecords);

        // Act
        List<MedicalRecord> result = medicalRecordService.getRecordsByMemberId(1);

        // Assert
        assertEquals(2, result.size());
        assertEquals(expectedRecords, result);
        verify(medicalRecordRepository, times(1)).findByMember_MemberID(1);
    }

    @Test
    public void testGetRecordsByMemberId_EmptyList() {
        // Arrange
        when(medicalRecordRepository.findByMember_MemberID(999)).thenReturn(Arrays.asList());

        // Act
        List<MedicalRecord> result = medicalRecordService.getRecordsByMemberId(999);

        // Assert
        assertTrue(result.isEmpty());
        verify(medicalRecordRepository, times(1)).findByMember_MemberID(999);
    }

    // ============= getFileLinksByMemberId tests =============

    @Test
    public void testGetFileLinksByMemberId_Success() {
        // Arrange
        List<String> expectedLinks = Arrays.asList(
            "https://example.com/file1.pdf",
            "https://example.com/file2.pdf"
        );
        when(medicalRecordRepository.findFileLinksByMember_MemberID(1)).thenReturn(expectedLinks);

        // Act
        List<String> result = medicalRecordService.getFileLinksByMemberId(1);

        // Assert
        assertEquals(2, result.size());
        assertEquals(expectedLinks, result);
        verify(medicalRecordRepository, times(1)).findFileLinksByMember_MemberID(1);
    }

    @Test
    public void testGetFileLinksByMemberId_EmptyList() {
        // Arrange
        when(medicalRecordRepository.findFileLinksByMember_MemberID(999)).thenReturn(Arrays.asList());

        // Act
        List<String> result = medicalRecordService.getFileLinksByMemberId(999);

        // Assert
        assertTrue(result.isEmpty());
        verify(medicalRecordRepository, times(1)).findFileLinksByMember_MemberID(999);
    }

    // ============= createMedicalRecord tests =============

    @Test
    public void testCreateMedicalRecord_Success() {
        // Arrange
        MedicalRecord newRecord = new MedicalRecord();
        newRecord.setMember(member);
        newRecord.setFileLink("https://example.com/newfile.pdf");
        newRecord.setDescription("New record");

        MedicalRecord savedRecord = new MedicalRecord();
        savedRecord.setRecordID(10);
        savedRecord.setMember(member);
        savedRecord.setFileLink("https://example.com/newfile.pdf");
        savedRecord.setDescription("New record");

        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(savedRecord);
        doNothing().when(eventPublisher).publishEvent(any(MedicalRecordCreatedEvent.class));

        // Act
        MedicalRecord result = medicalRecordService.createMedicalRecord(newRecord);

        // Assert
        assertNotNull(result);
        assertEquals(savedRecord.getRecordID(), result.getRecordID());
        assertEquals(savedRecord.getFileLink(), result.getFileLink());
        verify(medicalRecordRepository, times(1)).save(newRecord);
        verify(eventPublisher, times(1)).publishEvent(any(MedicalRecordCreatedEvent.class));
    }

    // ============= updateRecord tests =============

    @Test
    public void testUpdateRecord_IsUpdate_PublishesUpdateEvent() {
        // Arrange
        record.setDescription("Updated description");
        when(medicalRecordRepository.existsById(1)).thenReturn(true);
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(record);
        doNothing().when(eventPublisher).publishEvent(any(MedicalRecordUpdatedEvent.class));

        // Act
        MedicalRecord result = medicalRecordService.updateRecord(record);

        // Assert
        assertNotNull(result);
        assertEquals("Updated description", result.getDescription());
        verify(medicalRecordRepository, times(1)).existsById(1);
        verify(medicalRecordRepository, times(1)).save(record);
        verify(eventPublisher, times(1)).publishEvent(any(MedicalRecordUpdatedEvent.class));
    }

    @Test
    public void testUpdateRecord_IsCreate_DoesNotPublishUpdateEvent() {
        // Arrange
        MedicalRecord newRecord = new MedicalRecord();
        newRecord.setRecordID(null); // New record
        newRecord.setMember(member);
        newRecord.setFileLink("https://example.com/newfile.pdf");

        MedicalRecord savedRecord = new MedicalRecord();
        savedRecord.setRecordID(10);
        savedRecord.setMember(member);
        savedRecord.setFileLink("https://example.com/newfile.pdf");

        when(medicalRecordRepository.existsById(anyInt())).thenReturn(false);
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(savedRecord);
        doNothing().when(eventPublisher).publishEvent(any(MedicalRecordCreatedEvent.class));

        // Act
        MedicalRecord result = medicalRecordService.updateRecord(newRecord);

        // Assert
        assertNotNull(result);
        verify(medicalRecordRepository, times(1)).save(newRecord);
        verify(eventPublisher, never()).publishEvent(any(MedicalRecordUpdatedEvent.class));
    }

    @Test
    public void testUpdateRecord_RecordIdNull_DoesNotPublishUpdateEvent() {
        // Arrange
        MedicalRecord recordWithoutId = new MedicalRecord();
        recordWithoutId.setRecordID(null);
        recordWithoutId.setMember(member);
        recordWithoutId.setFileLink("https://example.com/file.pdf");

        MedicalRecord savedRecord = new MedicalRecord();
        savedRecord.setRecordID(10);
        savedRecord.setMember(member);
        savedRecord.setFileLink("https://example.com/file.pdf");

        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(savedRecord);

        // Act
        MedicalRecord result = medicalRecordService.updateRecord(recordWithoutId);

        // Assert
        assertNotNull(result);
        verify(medicalRecordRepository, times(1)).save(recordWithoutId);
        verify(medicalRecordRepository, never()).existsById(anyInt());
        verify(eventPublisher, never()).publishEvent(any(MedicalRecordUpdatedEvent.class));
    }

    // ============= deleteMedicalRecord tests =============

    @Test
    public void testDeleteMedicalRecord_Success() {
        // Arrange
        doNothing().when(medicalRecordRepository).deleteById(1);

        // Act
        Boolean result = medicalRecordService.deleteMedicalRecord(1);

        // Assert
        assertTrue(result);
        verify(medicalRecordRepository, times(1)).deleteById(1);
    }

    @Test
    public void testDeleteMedicalRecord_AlwaysReturnsTrue() {
        // Arrange
        doNothing().when(medicalRecordRepository).deleteById(999);

        // Act
        Boolean result = medicalRecordService.deleteMedicalRecord(999);

        // Assert
        assertTrue(result);
        verify(medicalRecordRepository, times(1)).deleteById(999);
    }
}
