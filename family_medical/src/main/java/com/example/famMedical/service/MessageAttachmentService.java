package com.example.famMedical.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.famMedical.Entity.Message;
import com.example.famMedical.Entity.MessageAttachment;
import com.example.famMedical.exception.ValidationException;
import com.example.famMedical.repository.MessageAttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageAttachmentService {

    private final MessageAttachmentRepository messageAttachmentRepository;
    private final Cloudinary cloudinary;

    // Maximum file size: 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // Supported file types
    private static final Set<String> SUPPORTED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"
    );
    
    private static final Set<String> SUPPORTED_DOCUMENT_TYPES = Set.of(
        "application/pdf",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
    );

    private static final Set<String> ALL_SUPPORTED_TYPES = new HashSet<>();
    
    static {
        ALL_SUPPORTED_TYPES.addAll(SUPPORTED_IMAGE_TYPES);
        ALL_SUPPORTED_TYPES.addAll(SUPPORTED_DOCUMENT_TYPES);
    }

    /**
     * Validate file size
     * @param file The file to validate
     * @throws ValidationException if file size exceeds maximum
     */
    public void validateFileSize(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException(
                String.format("File size exceeds maximum allowed size of 10MB. File size: %.2f MB", 
                    file.getSize() / (1024.0 * 1024.0))
            );
        }
    }

    /**
     * Validate file type
     * @param file The file to validate
     * @throws ValidationException if file type is not supported
     */
    public void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        
        if (contentType == null || !ALL_SUPPORTED_TYPES.contains(contentType)) {
            throw new ValidationException(
                String.format("Unsupported file type: %s. Supported types: images (JPEG, PNG, GIF, WebP, BMP), PDF, Word documents (.doc, .docx)", 
                    contentType != null ? contentType : "unknown")
            );
        }
    }

    /**
     * Validate a file (both size and type)
     * @param file The file to validate
     * @throws ValidationException if validation fails
     */
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("File cannot be empty");
        }
        
        validateFileSize(file);
        validateFileType(file);
    }

    /**
     * Upload file to Cloudinary
     * @param file The file to upload
     * @param folder The folder path in Cloudinary
     * @return The URL of the uploaded file
     * @throws IOException if upload fails
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        log.info("Uploading file {} to Cloudinary folder: {}", file.getOriginalFilename(), folder);
        
        // Validate file before upload
        validateFile(file);
        
        try {
            // Upload to Cloudinary
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto" // Auto-detect resource type (image, raw, video)
            );
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            String fileUrl = (String) uploadResult.get("secure_url");
            log.info("File uploaded successfully to: {}", fileUrl);
            
            return fileUrl;
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage());
            throw new IOException("Failed to upload file to cloud storage", e);
        }
    }

    /**
     * Create and save message attachment
     * @param message The message to attach the file to
     * @param file The file to attach
     * @param fileUrl The URL of the uploaded file
     * @return The saved MessageAttachment entity
     */
    @Transactional
    public MessageAttachment createAttachment(Message message, MultipartFile file, String fileUrl) {
        log.info("Creating attachment for message {}", message.getMessageID());
        
        MessageAttachment attachment = MessageAttachment.builder()
            .message(message)
            .filename(file.getOriginalFilename())
            .fileType(file.getContentType())
            .fileSize(file.getSize())
            .fileUrl(fileUrl)
            .uploadedAt(LocalDateTime.now())
            .build();
        
        MessageAttachment saved = messageAttachmentRepository.save(attachment);
        log.info("Attachment {} created successfully", saved.getAttachmentID());
        
        return saved;
    }

    /**
     * Process and upload multiple attachments for a message
     * @param message The message to attach files to
     * @param files The files to upload and attach
     * @return List of created MessageAttachment entities
     * @throws IOException if any upload fails
     */
    @Transactional
    public List<MessageAttachment> processAttachments(Message message, List<MultipartFile> files) throws IOException {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }
        
        log.info("Processing {} attachments for message {}", files.size(), message.getMessageID());
        
        List<MessageAttachment> attachments = new ArrayList<>();
        String folder = "messages/" + message.getMessageID();
        
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                // Upload file to Cloudinary
                String fileUrl = uploadFile(file, folder);
                
                // Create attachment record
                MessageAttachment attachment = createAttachment(message, file, fileUrl);
                attachments.add(attachment);
            }
        }
        
        log.info("Successfully processed {} attachments", attachments.size());
        return attachments;
    }

    /**
     * Get attachments for a message
     * @param messageId The message ID
     * @return List of attachments
     */
    @Transactional(readOnly = true)
    public List<MessageAttachment> getMessageAttachments(Integer messageId) {
        return messageAttachmentRepository.findByMessageID(messageId);
    }
}
