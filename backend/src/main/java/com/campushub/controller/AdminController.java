package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.admin.AdminStatsResponse;
import com.campushub.dto.admin.AuditLogResponse;
import com.campushub.dto.user.UserProfileDto;
import com.campushub.entity.Event.EventStatus;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.entity.LostFoundItem.LostFoundStatus;
import com.campushub.entity.Role;
import com.campushub.repository.*;
import com.campushub.service.AuditLogService;
import com.campushub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final InternshipRepository internshipRepository;
    private final AcademicResourceRepository resourceRepository;
    private final RideRepository rideRepository;
    private final TeamRepository teamRepository;
    private final MarketplaceItemRepository marketplaceRepository;
    private final LostFoundItemRepository lostFoundRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        AdminStatsResponse stats = AdminStatsResponse.builder()
                .totalStudents(userRepository.countByRole(Role.ROLE_STUDENT))
                .totalFaculty(userRepository.countByRole(Role.ROLE_FACULTY))
                .totalEvents(eventRepository.count())
                .pendingEvents(eventRepository.countByStatus(EventStatus.PENDING))
                .approvedEvents(eventRepository.countByStatus(EventStatus.APPROVED))
                .totalInternships(internshipRepository.countByStatus(InternshipStatus.ACTIVE))
                .totalResources(resourceRepository.count())
                .totalRides(rideRepository.count())
                .totalTeams(teamRepository.count())
                .totalMarketplaceItems(marketplaceRepository.count())
                .pendingLostFound(lostFoundRepository.count())
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers(@RequestParam(required = false) String query) {
        List<UserProfileDto> users = userService.searchUsers(query);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        UserProfileDto updated = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success(updated, "User role updated successfully."));
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<ApiResponse<UserProfileDto>> toggleUserStatus(@PathVariable Long id) {
        UserProfileDto updated = userService.toggleUserActiveStatus(id);
        return ResponseEntity.ok(ApiResponse.success(updated, "User status updated."));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs() {
        List<AuditLogResponse> logs = auditLogService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
