package com.example.famMedical.service;

import com.example.famMedical.Entity.*;
import com.example.famMedical.exception.ValidationException;
import com.example.famMedical.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MessageAttachmentIntegrationTest {

    @Autowired
    private MessageService messageService;

    @Autowired
    private MessageAttachmentService messageAttachmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyRepository familyRepository;

    @Autowired
    private DoctorAssignmentRepository doctorAssignmentRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    private User doctor;
    private User familyHead;
    private Family family;

    @BeforeEach
    void setUp() {
        // Create doctor
        doctor = new User();
        doctor.setFullName("Dr. Test");
        doctor.setEmail("doctor.integration@test.com");
        doctor.setPasswordHash("password");
        doctor.setRole(UserRole.BacSi);
        doctor = userRepository.save(doctor);

        // Create family head
        familyHead = new User();
        familyHead.setFullName("Family Head");
        familyHead.setEmail("family.integration@test.com");
        familyHead.setPasswordHash("password");
        familyHead.setRole(UserRole.ChuHo);
        familyHead = userRepository.save(familyHead);

        // Create family
        family = new Family();
        family.setFamilyName("Test Family");
        family.setHeadOfFamily(familyHead);
        family.setAddress("Test Address");
        family = familyRepository.save(family);

        // Create doctor assignment
        DoctorAssignment assignment = new DoctorAssignment();
        assignment.setDoctor(doctor);
        assignment.setFamily(family);
        assignment.setStatus(DoctorAssignment.AssignmentStatus.ACTIVE);
        doctorAssignmentRepository.save(assignment);
    }

    @Test
    @DisplayName("Should validate file size correctly")
    void testFileSizeValidation() {
        // Test file under limit
        byte[] smallContent = new byte[5 * 1024 * 1024]; // 5MB
        MultipartFile smallFile = new MockMultipartFile(
            "file", "small.jpg", "image/jpeg", smallContent
        );
        assertDoesNotThrow(() -> messageAttachmentService.validateFileSize(smallFile));

        // Test file over limit
        byte[] largeContent = new byte[11 * 1024 * 1024]; // 11MB
        MultipartFile largeFile = new MockMultipartFile(
            "file", "large.jpg", "image/jpeg", largeContent
        );
        assertThrows(ValidationException.class, 
            () -> messageAttachmentService.validateFileSize(largeFile));
    }

    @Test
    @DisplayName("Should validate file types correctly")
    void testFileTypeValidation() {
        // Test supported image types
        MultipartFile jpegFile = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", new byte[100]
        );
        assertDoesNotThrow(() -> messageAttachmentService.validateFileType(jpegFile));

        MultipartFile pngFile = new MockMultipartFile(
            "file", "test.png", "image/png", new byte[100]
        );
        assertDoesNotThrow(() -> messageAttachmentService.validateFileType(pngFile));

        // Test supported document types
        MultipartFile pdfFile = new MockMultipartFile(
            "file", "test.pdf", "application/pdf", new byte[100]
        );
        assertDoesNotThrow(() -> messageAttachmentService.validateFileType(pdfFile));

        MultipartFile docFile = new MockMultipartFile(
            "file", "test.doc", "application/msword", new byte[100]
        );
        assertDoesNotThrow(() -> messageAttachmentService.validateFileType(docFile));

        // Test unsupported type
        MultipartFile unsupportedFile = new MockMultipartFile(
            "file", "test.exe", "application/x-msdownload", new byte[100]
        );
        assertThrows(ValidationException.class, 
            () -> messageAttachmentService.validateFileType(unsupportedFile));
    }

    @Test
    @DisplayName("Should reject empty message content")
    void testEmptyMessageRejection() {
        assertThrows(ValidationException.class, () -> 
            messageService.sendMessage(
                doctor.getUserID(), 
                familyHead.getUserID(), 
                "", 
                null, 
                null
            )
        );

        assertThrows(ValidationException.class, () -> 
            messageService.sendMessage(
                doctor.getUserID(), 
                familyHead.getUserID(), 
                "   ", 
                null, 
                null
            )
        );
    }

    @Test
    @DisplayName("Should send message without attachments successfully")
    void testSendMessageWithoutAttachments() {
        // Send message
        Message message = messageService.sendMessage(
            doctor.getUserID(),
            familyHead.getUserID(),
            "Test message without attachments",
            null,
            null
        );

        // Verify message was created
        assertNotNull(message);
        assertNotNull(message.getMessageID());
        assertEquals("Test message without attachments", message.getContent());
        assertFalse(message.getIsRead());

        // Verify conversation was created
        assertNotNull(message.getConversation());
        assertEquals(doctor.getUserID(), message.getConversation().getDoctor().getUserID());
        assertEquals(family.getFamilyID(), message.getConversation().getFamily().getFamilyID());
    }
}
