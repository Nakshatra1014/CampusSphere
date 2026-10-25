package com.campushub.service;

import com.campushub.dto.lostfound.ClaimRequest;
import com.campushub.dto.lostfound.LostFoundItemRequest;
import com.campushub.dto.lostfound.LostFoundItemResponse;
import com.campushub.entity.LostFoundItem;
import com.campushub.entity.LostFoundItem.ItemType;
import com.campushub.entity.LostFoundItem.LostFoundStatus;
import com.campushub.entity.Notification.NotificationType;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ForbiddenException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.LostFoundItemRepository;
import com.campushub.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostFoundService {

    private final LostFoundItemRepository itemRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @Transactional
    public LostFoundItemResponse reportItem(LostFoundItemRequest request) {
        User reporter = securityUtils.getCurrentUser();

        LostFoundItem item = LostFoundItem.builder()
                .reportedBy(reporter)
                .itemType(request.getItemType())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory().trim())
                .location(request.getLocation().trim())
                .incidentDate(request.getIncidentDate())
                .imageUrl(request.getImageUrl())
                .contactInfo(request.getContactInfo() != null ? request.getContactInfo() : reporter.getPhone())
                .status(LostFoundStatus.ACTIVE)
                .build();

        LostFoundItem saved = itemRepository.save(item);
        return mapToResponse(saved, reporter);
    }

    @Transactional(readOnly = true)
    public List<LostFoundItemResponse> searchItems(ItemType itemType, String category, String location, LocalDate fromDate, String query) {
        User currentUser = getCurrentUserOrNull();
        List<LostFoundItem> items = itemRepository.searchItems(itemType, LostFoundStatus.ACTIVE, category, location, fromDate, query);
        return items.stream().map(i -> mapToResponse(i, currentUser)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LostFoundItemResponse getItemById(Long id) {
        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost & Found item not found with ID: " + id));
        return mapToResponse(item, getCurrentUserOrNull());
    }

    @Transactional
    public LostFoundItemResponse claimItem(Long id, ClaimRequest request) {
        User claimant = securityUtils.getCurrentUser();
        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost & Found item not found with ID: " + id));

        if (item.getReportedBy().getId().equals(claimant.getId())) {
            throw new BadRequestException("You reported this item yourself.");
        }

        if (item.getStatus() != LostFoundStatus.ACTIVE) {
            throw new BadRequestException("This item is not active for claims.");
        }

        item.setStatus(LostFoundStatus.CLAIMED);
        item.setClaimedBy(claimant);
        item.setClaimNote(request != null ? request.getClaimNote() : "Claim requested by " + claimant.getFullName());

        LostFoundItem saved = itemRepository.save(item);

        // Notify Reporter
        notificationService.createNotification(
                item.getReportedBy(),
                "Lost/Found Item Claimed",
                claimant.getFullName() + " submitted a claim for \"" + item.getTitle() + "\". Please coordinate for handover.",
                NotificationType.LOST_FOUND_CLAIMED,
                "LOST_FOUND",
                item.getId()
        );

        return mapToResponse(saved, claimant);
    }

    @Transactional
    public LostFoundItemResponse resolveItem(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost & Found item not found with ID: " + id));

        if (!item.getReportedBy().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the reporter or an admin can mark this item as resolved.");
        }

        item.setStatus(LostFoundStatus.RESOLVED);
        LostFoundItem saved = itemRepository.save(item);

        if (item.getClaimedBy() != null) {
            notificationService.createNotification(
                    item.getClaimedBy(),
                    "Lost/Found Item Handover Complete",
                    "The item \"" + item.getTitle() + "\" has been marked as resolved.",
                    NotificationType.LOST_FOUND_RESOLVED,
                    "LOST_FOUND",
                    item.getId()
            );
        }

        return mapToResponse(saved, currentUser);
    }

    @Transactional
    public LostFoundItemResponse moderateItem(Long id, LostFoundStatus status) {
        User admin = securityUtils.getCurrentUser();
        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        item.setStatus(status);
        return mapToResponse(itemRepository.save(item), admin);
    }

    @Transactional(readOnly = true)
    public List<LostFoundItemResponse> getMyReportedItems() {
        User currentUser = securityUtils.getCurrentUser();
        return itemRepository.findByReportedByOrderByCreatedAtDesc(currentUser).stream()
                .map(i -> mapToResponse(i, currentUser))
                .collect(Collectors.toList());
    }

    private User getCurrentUserOrNull() {
        try {
            return securityUtils.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public LostFoundItemResponse mapToResponse(LostFoundItem item, User currentUser) {
        boolean isReporter = currentUser != null && item.getReportedBy().getId().equals(currentUser.getId());

        return LostFoundItemResponse.builder()
                .id(item.getId())
                .reportedBy(userService.mapToSummaryDto(item.getReportedBy()))
                .itemType(item.getItemType())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .location(item.getLocation())
                .incidentDate(item.getIncidentDate())
                .imageUrl(item.getImageUrl())
                .contactInfo(item.getContactInfo())
                .status(item.getStatus())
                .claimedBy(userService.mapToSummaryDto(item.getClaimedBy()))
                .claimNote(item.getClaimNote())
                .isUserReporter(isReporter)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
