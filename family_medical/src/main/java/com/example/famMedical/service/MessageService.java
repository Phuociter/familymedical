package com.example.famMedical.service;

import com.example.famMedical.Entity.Conversation;
import com.example.famMedical.Entity.Message;
import com.example.famMedical.dto.MessageConnection;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageService {
    
    /**
     * Send a message from sender to recipient
     * @param senderID ID of the user sending the message
     * @param recipientID ID of the user receiving the message
     * @param content Message content
     * @param conversationID Optional conversation ID (if null, will be created/found)
     * @param attachments Optional file attachments
     * @return Created message
     */
    Message sendMessage(Integer senderID, Integer recipientID, String content, 
                       Long conversationID, List<MultipartFile> attachments);
    
    /**
     * Mark a message as read
     * @param messageID ID of the message to mark as read
     * @param userID ID of the user marking the message as read
     * @return Updated message
     */
    Message markMessageAsRead(Long messageID, Integer userID);
    
    /**
     * Mark all messages in a conversation as read for a user
     * @param conversationID ID of the conversation
     * @param userID ID of the user marking messages as read
     */
    void markConversationAsRead(Long conversationID, Integer userID);
    
    /**
     * Get all conversations for a user with pagination
     * @param userID ID of the user
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return List of conversations ordered by most recent message
     */
    List<Conversation> getUserConversations(Integer userID, int page, int size);
    
    /**
     * Get or create a conversation between a doctor and family
     * @param doctorID ID of the doctor
     * @param familyID ID of the family
     * @return Existing or newly created conversation
     */
    Conversation getOrCreateConversation(Integer doctorID, Integer familyID);
    
    /**
     * Get messages in a conversation with pagination
     * @param conversationID ID of the conversation
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return MessageConnection with messages and pagination info
     */
    MessageConnection getConversationMessages(Long conversationID, int page, int size);
    
    /**
     * Search messages with filters
     * @param userID ID of the user searching
     * @param keyword Search keyword (optional)
     * @param conversationID Filter by conversation (optional)
     * @param startDate Filter by start date (optional)
     * @param endDate Filter by end date (optional)
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return MessageConnection with search results
     */
    MessageConnection searchMessages(Integer userID, String keyword, Long conversationID,
                                    LocalDateTime startDate, LocalDateTime endDate,
                                    int page, int size);
    
    /**
     * Get count of unread messages for a user
     * @param userID ID of the user
     * @return Count of unread messages
     */
    int getUnreadMessageCount(Integer userID);
}
