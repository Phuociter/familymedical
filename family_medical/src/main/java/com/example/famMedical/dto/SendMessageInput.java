package com.example.famMedical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageInput {
    private Integer conversationID;
    private Integer recipientID;
    private String content;
    private List<MultipartFile> attachments;
}
