package com.example.famMedical.dto.events;

import com.example.famMedical.Entity.Message;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a new message is sent
 */
@Getter
public class NewMessageEvent extends ApplicationEvent {
    
    private final Message message;
    
    public NewMessageEvent(Object source, Message message) {
        super(source);
        this.message = message;
    }
}
