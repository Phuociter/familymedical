package com.example.famMedical.dto;

import com.example.famMedical.Entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationConnection {
    private List<Notification> notifications;
    private long totalCount;
    private boolean hasMore;
}
