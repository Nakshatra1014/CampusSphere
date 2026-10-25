package com.campushub.service;

import com.campushub.dto.admin.AuditLogResponse;
import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.AuditLog;
import com.campushub.entity.User;
import com.campushub.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(User actor, String action, String entityType, Long entityId, String details) {
        try {
            AuditLog logEntry = AuditLog.builder()
                    .actor(actor)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .build();
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        UserSummaryDto actorSummary = log.getActor() != null ? UserSummaryDto.builder()
                .id(log.getActor().getId())
                .fullName(log.getActor().getFullName())
                .email(log.getActor().getEmail())
                .role(log.getActor().getRole())
                .department(log.getActor().getDepartment())
                .profileImageUrl(log.getActor().getProfileImageUrl())
                .build() : null;

        return AuditLogResponse.builder()
                .id(log.getId())
                .actor(actorSummary)
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
