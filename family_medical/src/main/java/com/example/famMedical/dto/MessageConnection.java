package com.example.famMedical.dto;

import com.example.famMedical.Entity.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageConnection {
    private List<Message> messages;
    private long totalCount;
    private boolean hasMore;
}
