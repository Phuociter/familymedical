package com.example.famMedical.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.example.famMedical.Entity.Message;
import com.example.famMedical.Entity.MessageAttachment;
import com.example.famMedical.exception.ValidationException;
import com.example.famMedical.repository.MessageAttachmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageAttachmentServiceTest {

    @Mock
    private MessageAttachmentRepository messageAttachmentRepository;

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private MessageAttachmentService messageAttachmentService;

    private Message message;

    @BeforeEach
    void setUp() {
        message = Message.builder()
            .messageID(1)
            .content("Test message")
            .build();
    }

    @Nested
    @DisplayName("File Size Validation Tests")
    class FileSizeValidationTests {

        @Test
        @DisplayName("Should accept file under 10MB")
        void validateFileSize_UnderLimit_Success() {
            // Arrange
            byte[] content = new byte[5 * 1024 * 1024]; // 5MB
            MultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", content
            );

            // Act & Assert
            assertDoesNotThrow(() -> messageAttachmentService.validateFileSize(file));
        }

        @Test
        @DisplayName("Should accept file exactly 10MB")
        void validateFileSize_ExactlyLimit_Success() {
            // Arrange
            byte[] content = new byte[10 * 1024 * 1024]; // 10MB
            MultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", content
            );

            // Act & Assert
            assertDoesNotThrow(() -> messageAttachmentService.validateFileSize(file));
        }

        @Test
        @DisplayName("Should reject file over 10MB")
        void validateFileSize_OverLimit_ThrowsValidationException() {
            // Arrange
            byte[] content = new byte[11 * 1024 * 1024]; // 11MB
            MultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", content
            );

            // Act & Assert
            ValidationException exception = assertThrows(
                ValidationException.class,
                () -> messageAttachmentService.validateFileSize(file)
            );
            assertTrue(exception.getMessage().contains("exceeds maximum allowed size"));
        }
    }

    @Nested
    @DisplayName("File Type Validation Tests")
    class FileTypeValidationTests {

        @Test
        @DisplayName("Should accept JPEG image")
        void validateFileType_JPEG_Success() {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[100]
            );

            // Act & Assert
            assertDoesNotThrow(() -> messageAttachmentService.validateFileType(file));
        }

        @Test
        @DisplayName("Should accept PNG image")
        void validateFileType_PNG_Success() {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.png", "image/png", new byte[100]
            );

            // Act & Assert
            assertDoesNotThrow(() -> messageAttachmentService.validateFileType(file));
        }

        @Test
        @DisplayName("Should accept PDF document")
        void validateFileType_PDF_Success() {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", new byte[100]
            );

            // Act & Assert
            assertDoesNotThrow(() -> messageAttachmentService.validateFileType(file));
        }

        @Test
        @DisplayName("Should accept Word .doc document")
        void validateFileType_DOC_Success() {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.doc", "application/msword", new byte[100]
            );

            // Act & Assert
            assertDoesNotThrow(() -> messageAttachmentService.validateFileType(file));
        }

        @Test
        @DisplayName("Should accept Word .docx document")
        void validateFileType_DOCX_Success() {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.docx", 
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                new byte[100]
            );

            // Act & Assert
            assertDoesNotThrow(() -> messageAttachmentService.validateFileType(file));
        }

        @Test
        @DisplayName("Should reject unsupported file type")
        void validateFileType_UnsupportedType_ThrowsValidationException() {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.exe", "application/x-msdownload", new byte[100]
            );

            // Act & Assert
            ValidationException exception = assertThrows(
                ValidationException.class,
                () -> messageAttachmentService.validateFileType(file)
            );
            assertTrue(exception.getMessage().contains("Unsupported file type"));
        }

        @Test
        @DisplayName("Should reject file with null content type")
        void validateFileType_NullContentType_ThrowsValidationException() {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.txt", null, new byte[100]
            );

            // Act & Assert
            ValidationException exception = assertThrows(
                ValidationException.class,
                () -> messageAttachmentService.validateFileType(file)
            );
            assertTrue(exception.getMessage().contains("Unsupported file type"));
        }
    }

    @Nested
    @DisplayName("File Upload Tests")
    class FileUploadTests {

        @Test
        @DisplayName("Should upload file successfully")
        void uploadFile_ValidFile_Success() throws IOException {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[1024]
            );
            
            Map<String, Object> uploadResult = new HashMap<>();
            uploadResult.put("secure_url", "https://cloudinary.com/test.jpg");
            
            when(cloudinary.uploader()).thenReturn(uploader);
            when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

            // Act
            String result = messageAttachmentService.uploadFile(file, "messages/1");

            // Assert
            assertNotNull(result);
            assertEquals("https://cloudinary.com/test.jpg", result);
            verify(uploader).upload(any(byte[].class), anyMap());
        }

        @Test
        @DisplayName("Should throw ValidationException for invalid file")
        void uploadFile_InvalidFile_ThrowsValidationException() {
            // Arrange
            byte[] content = new byte[11 * 1024 * 1024]; // 11MB - over limit
            MultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", content
            );

            // Act & Assert
            assertThrows(ValidationException.class, () -> 
                messageAttachmentService.uploadFile(file, "messages/1")
            );
        }

        @Test
        @DisplayName("Should throw IOException when upload fails")
        void uploadFile_UploadFails_ThrowsIOException() throws IOException {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[1024]
            );
            
            when(cloudinary.uploader()).thenReturn(uploader);
            when(uploader.upload(any(byte[].class), anyMap()))
                .thenThrow(new IOException("Upload failed"));

            // Act & Assert
            assertThrows(IOException.class, () -> 
                messageAttachmentService.uploadFile(file, "messages/1")
            );
        }
    }

    @Nested
    @DisplayName("Create Attachment Tests")
    class CreateAttachmentTests {

        @Test
        @DisplayName("Should create attachment successfully")
        void createAttachment_ValidData_Success() {
            // Arrange
            MultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[1024]
            );
            String fileUrl = "https://cloudinary.com/test.jpg";
            
            MessageAttachment expectedAttachment = MessageAttachment.builder()
                .attachmentID(1)
                .message(message)
                .filename("test.jpg")
                .fileType("image/jpeg")
                .fileSize(1024L)
                .fileUrl(fileUrl)
                .build();
            
            when(messageAttachmentRepository.save(any(MessageAttachment.class)))
                .thenReturn(expectedAttachment);

            // Act
            MessageAttachment result = messageAttachmentService.createAttachment(
                message, file, fileUrl
            );

            // Assert
            assertNotNull(result);
            assertEquals("test.jpg", result.getFilename());
            assertEquals("image/jpeg", result.getFileType());
            assertEquals(1024L, result.getFileSize());
            assertEquals(fileUrl, result.getFileUrl());
            verify(messageAttachmentRepository).save(any(MessageAttachment.class));
        }
    }

    @Nested
    @DisplayName("Process Attachments Tests")
    class ProcessAttachmentsTests {

        @Test
        @DisplayName("Should process multiple attachments successfully")
        void processAttachments_MultipleFiles_Success() throws IOException {
            // Arrange
            MultipartFile file1 = new MockMultipartFile(
                "file1", "test1.jpg", "image/jpeg", new byte[1024]
            );
            MultipartFile file2 = new MockMultipartFile(
                "file2", "test2.pdf", "application/pdf", new byte[2048]
            );
            List<MultipartFile> files = List.of(file1, file2);
            
            Map<String, Object> uploadResult1 = new HashMap<>();
            uploadResult1.put("secure_url", "https://cloudinary.com/test1.jpg");
            
            Map<String, Object> uploadResult2 = new HashMap<>();
            uploadResult2.put("secure_url", "https://cloudinary.com/test2.pdf");
            
            when(cloudinary.uploader()).thenReturn(uploader);
            when(uploader.upload(any(byte[].class), anyMap()))
                .thenReturn(uploadResult1)
                .thenReturn(uploadResult2);
            
            MessageAttachment attachment1 = MessageAttachment.builder()
                .attachmentID(1)
                .filename("test1.jpg")
                .build();
            MessageAttachment attachment2 = MessageAttachment.builder()
                .attachmentID(2)
                .filename("test2.pdf")
                .build();
            
            when(messageAttachmentRepository.save(any(MessageAttachment.class)))
                .thenReturn(attachment1)
                .thenReturn(attachment2);

            // Act
            List<MessageAttachment> result = messageAttachmentService.processAttachments(
                message, files
            );

            // Assert
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(uploader, times(2)).upload(any(byte[].class), anyMap());
            verify(messageAttachmentRepository, times(2)).save(any(MessageAttachment.class));
        }

        @Test
        @DisplayName("Should return empty list for null files")
        void processAttachments_NullFiles_ReturnsEmptyList() throws IOException {
            // Act
            List<MessageAttachment> result = messageAttachmentService.processAttachments(
                message, null
            );

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Should return empty list for empty files list")
        void processAttachments_EmptyFilesList_ReturnsEmptyList() throws IOException {
            // Act
            List<MessageAttachment> result = messageAttachmentService.processAttachments(
                message, List.of()
            );

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("Get Message Attachments Tests")
    class GetMessageAttachmentsTests {

        @Test
        @DisplayName("Should get attachments for message")
        void getMessageAttachments_ValidMessageId_ReturnsAttachments() {
            // Arrange
            MessageAttachment attachment1 = MessageAttachment.builder()
                .attachmentID(1)
                .filename("test1.jpg")
                .build();
            MessageAttachment attachment2 = MessageAttachment.builder()
                .attachmentID(2)
                .filename("test2.pdf")
                .build();
            
            when(messageAttachmentRepository.findByMessageID(1))
                .thenReturn(List.of(attachment1, attachment2));

            // Act
            List<MessageAttachment> result = messageAttachmentService.getMessageAttachments(1);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(messageAttachmentRepository).findByMessageID(1);
        }
    }
}
