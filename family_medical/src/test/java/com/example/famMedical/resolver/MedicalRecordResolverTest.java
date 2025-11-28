package com.example.famMedical.resolver;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
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
import com.example.famMedical.dto.CreateMedicalRecordInput;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.UserRepository;
import com.example.famMedical.service.MedicalRecordService;

@ExtendWith(MockitoExtension.class)
@DisplayName("MedicalRecordResolver Tests")
public class MedicalRecordResolverTest {

    @Mock
    private MedicalRecordService medicalRecordService;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MedicalRecordResolver medicalRecordResolver;

    private MedicalRecord medicalRecord;
    private Member member;
    private Family family;
    private User headOfFamily;
    private CreateMedicalRecordInput input;

    @BeforeEach
    public void setUp() {
        // Setup head of family
        headOfFamily = new User();
        headOfFamily.setUserID(1);
        headOfFamily.setEmail("head@example.com");
        headOfFamily.setFullName("Head of Family");
        headOfFamily.setRole(UserRole.ChuHo);

        // Setup family
        family = new Family();
        family.setFamilyID(100);
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(headOfFamily);

        // Setup member
        member = new Member();
        member.setMemberID(10);
        member.setFullName("Test Member");
        member.setFamily(family);

        // Setup medical record
        medicalRecord = new MedicalRecord();
        medicalRecord.setRecordID(1);
        medicalRecord.setMember(member);
        medicalRecord.setFileLink("https://example.com/file.pdf");
        medicalRecord.setDescription("Test description");
        medicalRecord.setRecordDate(LocalDate.now());
        medicalRecord.setFileType(MedicalRecord.FileType.Phieu_Kham_Benh);

        // Setup input
        input = new CreateMedicalRecordInput();
        input.setMemberID(10);
        input.setFileLink("https://example.com/file.pdf");
        input.setDescription("Test description");
        input.setRecordDate(LocalDate.now());
        input.setFileType("Phieu_Kham_Benh");
    }

    @Nested
    @DisplayName("Query Mapping Tests")
    class QueryMappingTests {

        @Test
        @DisplayName("Should get medical records by member - success")
        public void shouldGetMedicalRecordsByMember_Success() {
            // Arrange
            MedicalRecord record2 = new MedicalRecord();
            record2.setRecordID(2);
            record2.setMember(member);
            record2.setFileLink("https://example.com/file2.pdf");

            List<MedicalRecord> expectedRecords = Arrays.asList(medicalRecord, record2);
            when(medicalRecordService.getRecordsByMemberId(10)).thenReturn(expectedRecords);

            // Act
            List<MedicalRecord> result = medicalRecordResolver.getMedicalRecordsByMember(10);

            // Assert
            assertEquals(2, result.size());
            assertEquals(expectedRecords, result);
            verify(medicalRecordService, times(1)).getRecordsByMemberId(10);
        }

        @Test
        @DisplayName("Should get medical records by member - empty list")
        public void shouldGetMedicalRecordsByMember_EmptyList() {
            // Arrange
            when(medicalRecordService.getRecordsByMemberId(999)).thenReturn(Arrays.asList());

            // Act
            List<MedicalRecord> result = medicalRecordResolver.getMedicalRecordsByMember(999);

            // Assert
            assertTrue(result.isEmpty());
            verify(medicalRecordService, times(1)).getRecordsByMemberId(999);
        }
    }

    @Nested
    @DisplayName("Mutation Mapping Tests - Create Medical Record")
    class CreateMedicalRecordTests {

        @Test
        @DisplayName("Should create medical record - success")
        public void shouldCreateMedicalRecord_Success() {
            // Arrange
            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordService.createMedicalRecord(any(MedicalRecord.class)))
                .thenReturn(medicalRecord);

            // Act
            MedicalRecord result = medicalRecordResolver.createMedicalRecord(input);

            // Assert
            assertNotNull(result);
            assertEquals(medicalRecord.getRecordID(), result.getRecordID());
            assertEquals(medicalRecord.getFileLink(), result.getFileLink());
            assertEquals(medicalRecord.getDescription(), result.getDescription());
            verify(memberRepository, times(1)).findById(10);
            verify(medicalRecordService, times(1)).createMedicalRecord(any(MedicalRecord.class));
        }

        @Test
        @DisplayName("Should create medical record with valid file type enum")
        public void shouldCreateMedicalRecord_WithValidFileType() {
            // Arrange
            input.setFileType("Xet_Nghiem_Mau");
            medicalRecord.setFileType(MedicalRecord.FileType.Xet_Nghiem_Mau);

            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordService.createMedicalRecord(any(MedicalRecord.class)))
                .thenReturn(medicalRecord);

            // Act
            MedicalRecord result = medicalRecordResolver.createMedicalRecord(input);

            // Assert
            assertNotNull(result);
            assertEquals(MedicalRecord.FileType.Xet_Nghiem_Mau, result.getFileType());
            verify(memberRepository, times(1)).findById(10);
        }

        @Test
        @DisplayName("Should create medical record with null file type")
        public void shouldCreateMedicalRecord_WithNullFileType() {
            // Arrange
            input.setFileType(null);
            medicalRecord.setFileType(null);

            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordService.createMedicalRecord(any(MedicalRecord.class)))
                .thenReturn(medicalRecord);

            // Act
            MedicalRecord result = medicalRecordResolver.createMedicalRecord(input);

            // Assert
            assertNotNull(result);
            assertNull(result.getFileType());
            verify(memberRepository, times(1)).findById(10);
        }

        @Test
        @DisplayName("Should create medical record with empty file type")
        public void shouldCreateMedicalRecord_WithEmptyFileType() {
            // Arrange
            input.setFileType("   ");
            medicalRecord.setFileType(null);

            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordService.createMedicalRecord(any(MedicalRecord.class)))
                .thenReturn(medicalRecord);

            // Act
            MedicalRecord result = medicalRecordResolver.createMedicalRecord(input);

            // Assert
            assertNotNull(result);
            assertNull(result.getFileType());
            verify(memberRepository, times(1)).findById(10);
        }

        @Test
        @DisplayName("Should throw exception when member not found")
        public void shouldThrowExceptionWhenMemberNotFound() {
            // Arrange
            when(memberRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                input.setMemberID(999);
                medicalRecordResolver.createMedicalRecord(input);
            });

            assertTrue(exception.getMessage().contains("Member not found"));
            verify(memberRepository, times(1)).findById(999);
            verify(medicalRecordService, never()).createMedicalRecord(any(MedicalRecord.class));
        }

        @Test
        @DisplayName("Should throw exception when file type is invalid")
        public void shouldThrowExceptionWhenFileTypeInvalid() {
            // Arrange
            input.setFileType("INVALID_TYPE");
            when(memberRepository.findById(10)).thenReturn(Optional.of(member));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                medicalRecordResolver.createMedicalRecord(input)
            );

            assertTrue(exception.getMessage().contains("Invalid file type"));
            verify(memberRepository, times(1)).findById(10);
            verify(medicalRecordService, never()).createMedicalRecord(any(MedicalRecord.class));
        }

        @Test
        @DisplayName("Should create medical record with all fields")
        public void shouldCreateMedicalRecord_WithAllFields() {
            // Arrange
            input.setFileType("Don_Thuoc");
            input.setFileLink("https://example.com/prescription.pdf");
            input.setDescription("Prescription for patient");
            input.setRecordDate(LocalDate.of(2024, 1, 15));

            MedicalRecord expectedRecord = new MedicalRecord();
            expectedRecord.setRecordID(1);
            expectedRecord.setMember(member);
            expectedRecord.setFileType(MedicalRecord.FileType.Don_Thuoc);
            expectedRecord.setFileLink("https://example.com/prescription.pdf");
            expectedRecord.setDescription("Prescription for patient");
            expectedRecord.setRecordDate(LocalDate.of(2024, 1, 15));

            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordService.createMedicalRecord(any(MedicalRecord.class)))
                .thenReturn(expectedRecord);

            // Act
            MedicalRecord result = medicalRecordResolver.createMedicalRecord(input);

            // Assert
            assertNotNull(result);
            assertEquals(MedicalRecord.FileType.Don_Thuoc, result.getFileType());
            assertEquals("https://example.com/prescription.pdf", result.getFileLink());
            assertEquals("Prescription for patient", result.getDescription());
            assertEquals(LocalDate.of(2024, 1, 15), result.getRecordDate());
            verify(memberRepository, times(1)).findById(10);
        }
    }

    @Nested
    @DisplayName("Mutation Mapping Tests - Delete Record")
    class DeleteRecordTests {

        @Test
        @DisplayName("Should delete record - success")
        public void shouldDeleteRecord_Success() {
            // Arrange
            when(medicalRecordService.deleteMedicalRecord(1)).thenReturn(true);

            // Act
            Boolean result = medicalRecordResolver.deleteRecord(1);

            // Assert
            assertTrue(result);
            verify(medicalRecordService, times(1)).deleteMedicalRecord(1);
        }

        @Test
        @DisplayName("Should delete record - always returns true")
        public void shouldDeleteRecord_AlwaysReturnsTrue() {
            // Arrange
            when(medicalRecordService.deleteMedicalRecord(999)).thenReturn(true);

            // Act
            Boolean result = medicalRecordResolver.deleteRecord(999);

            // Assert
            assertTrue(result);
            verify(medicalRecordService, times(1)).deleteMedicalRecord(999);
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle case-insensitive file type")
        public void shouldHandleCaseSensitiveFileType() {
            // Arrange
            input.setFileType("phieu_kham_benh"); // lowercase
            when(memberRepository.findById(10)).thenReturn(Optional.of(member));

            // Act & Assert - Should throw exception because enum is case-sensitive
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                medicalRecordResolver.createMedicalRecord(input)
            );

            assertTrue(exception.getMessage().contains("Invalid file type"));
        }

        @Test
        @DisplayName("Should handle null description in input")
        public void shouldHandleNullDescriptionInInput() {
            // Arrange
            input.setDescription(null);
            medicalRecord.setDescription(null);

            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordService.createMedicalRecord(any(MedicalRecord.class)))
                .thenReturn(medicalRecord);

            // Act
            MedicalRecord result = medicalRecordResolver.createMedicalRecord(input);

            // Assert
            assertNotNull(result);
            assertNull(result.getDescription());
            verify(memberRepository, times(1)).findById(10);
        }

        @Test
        @DisplayName("Should handle null record date in input")
        public void shouldHandleNullRecordDateInInput() {
            // Arrange
            input.setRecordDate(null);
            medicalRecord.setRecordDate(null);

            when(memberRepository.findById(10)).thenReturn(Optional.of(member));
            when(medicalRecordService.createMedicalRecord(any(MedicalRecord.class)))
                .thenReturn(medicalRecord);

            // Act
            MedicalRecord result = medicalRecordResolver.createMedicalRecord(input);

            // Assert
            assertNotNull(result);
            assertNull(result.getRecordDate());
            verify(memberRepository, times(1)).findById(10);
        }
    }
}

