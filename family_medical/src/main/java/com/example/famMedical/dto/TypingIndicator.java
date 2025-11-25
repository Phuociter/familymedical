package com.example.famMedical.dto;

import com.example.famMedical.Entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for typing indicator events
 * Represents when a user is typing in a conversation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicator {
    private Long conversationID;
    private User user;
    private boolean isTyping;
}
