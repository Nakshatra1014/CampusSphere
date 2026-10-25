package com.campushub.service;

import com.campushub.dto.notification.NotificationResponse;
import com.campushub.entity.Notification;
import com.campushub.entity.Notification.NotificationType;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.NotificationRepository;
import com.campushub.repository.UserRepository;
import com.campushub.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public void createNotification(User recipient, String title, String message, NotificationType type, String entityType, Long entityId) {
        if (recipient == null) return;
        try {
            Notification notification = Notification.builder()
                    .user(recipient)
                    .title(title)
                    .message(message)
                    .type(type)
                    .targetEntityType(entityType)
                    .targetEntityId(entityId)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to persist notification for user {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public void notifyAllAdmins(String title, String message, NotificationType type, String entityType, Long entityId) {
        List<User> admins = userRepository.findByRole(Role.ROLE_ADMIN);
        for (User admin : admins) {
            createNotification(admin, title, message, type, entityType, entityId);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getCurrentUserNotifications() {
        User user = securityUtils.getCurrentUser();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User user = securityUtils.getCurrentUser();
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        User user = securityUtils.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found for current user.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User user = securityUtils.getCurrentUser();
        notificationRepository.markAllAsReadForUser(user);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        User user = securityUtils.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found for current user.");
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public void deleteAllNotifications() {
        User user = securityUtils.getCurrentUser();
        notificationRepository.deleteAllForUser(user);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .targetEntityType(n.getTargetEntityType())
                .targetEntityId(n.getTargetEntityId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
