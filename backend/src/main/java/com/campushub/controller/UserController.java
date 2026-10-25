package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.user.UpdateProfileRequest;
import com.campushub.dto.user.UserProfileDto;
import com.campushub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUserProfile() {
        UserProfileDto profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserProfileDto updated = userService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully."));
    }

    @PostMapping(value = "/me/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileDto>> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        UserProfileDto updated = userService.updateProfilePhoto(file);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile photo updated successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserById(@PathVariable("id") Long id) {
        UserProfileDto profile = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> searchUsers(@RequestParam(value = "query", required = false) String query) {
        List<UserProfileDto> users = userService.searchUsers(query);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
