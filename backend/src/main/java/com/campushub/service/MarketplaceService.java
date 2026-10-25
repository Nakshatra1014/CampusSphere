package com.campushub.service;

import com.campushub.dto.marketplace.MarketplaceItemRequest;
import com.campushub.dto.marketplace.MarketplaceItemResponse;
import com.campushub.entity.MarketplaceItem;
import com.campushub.entity.MarketplaceItem.ItemCondition;
import com.campushub.entity.MarketplaceItem.ItemStatus;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.ForbiddenException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.MarketplaceItemRepository;
import com.campushub.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceItemRepository itemRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final SecurityUtils securityUtils;

    @Transactional
    public MarketplaceItemResponse createListing(MarketplaceItemRequest request) {
        User seller = securityUtils.getCurrentUser();

        MarketplaceItem item = MarketplaceItem.builder()
                .seller(seller)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory().trim())
                .price(request.getPrice())
                .itemCondition(request.getItemCondition())
                .imageUrl(request.getImageUrl())
                .contactPhone(request.getContactPhone() != null ? request.getContactPhone() : seller.getPhone())
                .status(ItemStatus.AVAILABLE)
                .build();

        MarketplaceItem saved = itemRepository.save(item);
        auditLogService.logAction(seller, "MARKETPLACE_ITEM_CREATED", "MARKETPLACE", saved.getId(), "Listed item: " + saved.getTitle());
        return mapToResponse(saved, seller);
    }

    @Transactional(readOnly = true)
    public List<MarketplaceItemResponse> searchItems(String category, ItemCondition condition, BigDecimal maxPrice, String query) {
        User currentUser = getCurrentUserOrNull();
        List<MarketplaceItem> items = itemRepository.searchItems(ItemStatus.AVAILABLE, category, condition, maxPrice, query);
        return items.stream().map(i -> mapToResponse(i, currentUser)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MarketplaceItemResponse getItemById(Long id) {
        MarketplaceItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marketplace item not found with ID: " + id));
        return mapToResponse(item, getCurrentUserOrNull());
    }

    @Transactional
    public MarketplaceItemResponse updateListing(Long id, MarketplaceItemRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        MarketplaceItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (!item.getSeller().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only edit your own listings.");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setPrice(request.getPrice());
        item.setItemCondition(request.getItemCondition());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());
        if (request.getContactPhone() != null) item.setContactPhone(request.getContactPhone());

        return mapToResponse(itemRepository.save(item), currentUser);
    }

    @Transactional
    public MarketplaceItemResponse markAsSold(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        MarketplaceItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (!item.getSeller().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only mark your own listings as sold.");
        }

        item.setStatus(ItemStatus.SOLD);
        return mapToResponse(itemRepository.save(item), currentUser);
    }

    @Transactional
    public void deleteListing(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        MarketplaceItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (!item.getSeller().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only delete your own listings.");
        }

        itemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<MarketplaceItemResponse> getMyListings() {
        User user = securityUtils.getCurrentUser();
        return itemRepository.findBySellerOrderByCreatedAtDesc(user).stream()
                .map(i -> mapToResponse(i, user))
                .collect(Collectors.toList());
    }

    private User getCurrentUserOrNull() {
        try {
            return securityUtils.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public MarketplaceItemResponse mapToResponse(MarketplaceItem item, User currentUser) {
        boolean isOwner = currentUser != null && item.getSeller().getId().equals(currentUser.getId());
        return MarketplaceItemResponse.builder()
                .id(item.getId())
                .seller(userService.mapToSummaryDto(item.getSeller()))
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .price(item.getPrice())
                .itemCondition(item.getItemCondition())
                .imageUrl(item.getImageUrl())
                .contactPhone(item.getContactPhone())
                .status(item.getStatus())
                .isUserSeller(isOwner)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
