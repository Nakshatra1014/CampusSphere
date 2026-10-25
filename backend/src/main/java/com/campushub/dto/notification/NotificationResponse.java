package com.campushub.dto.notification;

import com.campushub.entity.Notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private String targetEntityType;
    private Long targetEntityId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
