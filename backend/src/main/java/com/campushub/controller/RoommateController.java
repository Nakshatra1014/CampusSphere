package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.roommate.RoommateProfileRequest;
import com.campushub.dto.roommate.RoommateProfileResponse;
import com.campushub.service.RoommateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roommates")
@RequiredArgsConstructor
public class RoommateController {

    private final RoommateService roommateService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoommateProfileResponse>> createOrUpdateProfile(
            @Valid @RequestBody RoommateProfileRequest request
    ) {
        RoommateProfileResponse response = roommateService.createOrUpdateProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Roommate profile saved successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<RoommateProfileResponse>> getMyProfile() {
        RoommateProfileResponse response = roommateService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoommateProfileResponse>>> searchProfiles(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String budget,
            @RequestParam(required = false) String occupancy,
            @RequestParam(required = false) String lifestyle,
            @RequestParam(required = false) String search
    ) {
        List<RoommateProfileResponse> list = roommateService.searchProfiles(location, budget, occupancy, lifestyle, search);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoommateProfileResponse>> getProfileById(@PathVariable Long id) {
        RoommateProfileResponse response = roommateService.getProfileById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/toggle-status")
    public ResponseEntity<ApiResponse<RoommateProfileResponse>> toggleActiveStatus() {
        RoommateProfileResponse response = roommateService.toggleActiveStatus();
        return ResponseEntity.ok(ApiResponse.success(response, "Roommate profile visibility toggled."));
    }
}
