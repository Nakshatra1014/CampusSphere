package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.lostfound.ClaimRequest;
import com.campushub.dto.lostfound.LostFoundItemRequest;
import com.campushub.dto.lostfound.LostFoundItemResponse;
import com.campushub.entity.LostFoundItem.ItemType;
import com.campushub.entity.LostFoundItem.LostFoundStatus;
import com.campushub.service.LostFoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lost-found")
@RequiredArgsConstructor
public class LostFoundController {

    private final LostFoundService lostFoundService;

    @PostMapping
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> reportItem(@Valid @RequestBody LostFoundItemRequest request) {
        LostFoundItemResponse response = lostFoundService.reportItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Item reported successfully."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LostFoundItemResponse>>> searchItems(
            @RequestParam(required = false) ItemType itemType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) String search
    ) {
        List<LostFoundItemResponse> list = lostFoundService.searchItems(itemType, category, location, fromDate, search);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> getItemById(@PathVariable Long id) {
        LostFoundItemResponse item = lostFoundService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> claimItem(
            @PathVariable Long id,
            @RequestBody(required = false) ClaimRequest request
    ) {
        LostFoundItemResponse item = lostFoundService.claimItem(id, request);
        return ResponseEntity.ok(ApiResponse.success(item, "Claim request submitted. The reporter has been notified."));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> resolveItem(@PathVariable Long id) {
        LostFoundItemResponse item = lostFoundService.resolveItem(id);
        return ResponseEntity.ok(ApiResponse.success(item, "Item resolved successfully."));
    }

    @PutMapping("/admin/{id}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> moderateItem(
            @PathVariable Long id,
            @RequestParam LostFoundStatus status
    ) {
        LostFoundItemResponse item = lostFoundService.moderateItem(id, status);
        return ResponseEntity.ok(ApiResponse.success(item, "Item status updated by admin."));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<ApiResponse<List<LostFoundItemResponse>>> getMyReportedItems() {
        List<LostFoundItemResponse> list = lostFoundService.getMyReportedItems();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
