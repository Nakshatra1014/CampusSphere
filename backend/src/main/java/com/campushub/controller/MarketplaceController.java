package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.marketplace.MarketplaceItemRequest;
import com.campushub.dto.marketplace.MarketplaceItemResponse;
import com.campushub.entity.MarketplaceItem.ItemCondition;
import com.campushub.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @PostMapping
    public ResponseEntity<ApiResponse<MarketplaceItemResponse>> createListing(@Valid @RequestBody MarketplaceItemRequest request) {
        MarketplaceItemResponse response = marketplaceService.createListing(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Marketplace listing created successfully."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MarketplaceItemResponse>>> searchItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ItemCondition condition,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search
    ) {
        List<MarketplaceItemResponse> items = marketplaceService.searchItems(category, condition, maxPrice, search);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MarketplaceItemResponse>> getItemById(@PathVariable Long id) {
        MarketplaceItemResponse item = marketplaceService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MarketplaceItemResponse>> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody MarketplaceItemRequest request
    ) {
        MarketplaceItemResponse updated = marketplaceService.updateListing(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Listing updated successfully."));
    }

    @PutMapping("/{id}/sold")
    public ResponseEntity<ApiResponse<MarketplaceItemResponse>> markAsSold(@PathVariable Long id) {
        MarketplaceItemResponse updated = marketplaceService.markAsSold(id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Item marked as sold."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable Long id) {
        marketplaceService.deleteListing(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Listing deleted successfully."));
    }

    @GetMapping({"/my", "/my-listings"})
    public ResponseEntity<ApiResponse<List<MarketplaceItemResponse>>> getMyListings() {
        List<MarketplaceItemResponse> list = marketplaceService.getMyListings();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
