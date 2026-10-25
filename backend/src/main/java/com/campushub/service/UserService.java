package com.campushub.service;

import com.campushub.dto.user.UpdateProfileRequest;
import com.campushub.dto.user.UserProfileDto;
import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.UserRepository;
import com.campushub.security.SecurityUtils;
import com.campushub.service.storage.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final CloudinaryService cloudinaryService;

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final long MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile() {
        User currentUser = securityUtils.getCurrentUser();
        return mapToProfileDto(currentUser);
    }

    @Transactional
    public UserProfileDto updateCurrentUserProfile(UpdateProfileRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        currentUser.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) currentUser.setPhone(request.getPhone());
        if (request.getDepartment() != null) currentUser.setDepartment(request.getDepartment());
        if (request.getAcademicYear() != null) currentUser.setAcademicYear(request.getAcademicYear());
        if (request.getCollege() != null) currentUser.setCollege(request.getCollege());
        if (request.getBio() != null) currentUser.setBio(request.getBio());
        if (request.getSkills() != null) currentUser.setSkills(request.getSkills());
        if (request.getProfileImageUrl() != null) currentUser.setProfileImageUrl(request.getProfileImageUrl());

        User updated = userRepository.save(currentUser);
        return mapToProfileDto(updated);
    }

    @Transactional
    public UserProfileDto updateProfilePhoto(MultipartFile file) {
        User currentUser = securityUtils.getCurrentUser();
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select an image file to upload.");
        }

        if (file.getSize() > MAX_PHOTO_SIZE) {
            throw new BadRequestException("Profile photo size exceeds maximum limit of 5MB.");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        String contentType = file.getContentType();
        boolean validContentType = contentType != null && (
                contentType.equalsIgnoreCase("image/jpeg") ||
                contentType.equalsIgnoreCase("image/png") ||
                contentType.equalsIgnoreCase("image/webp")
        );

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(ext) && !validContentType) {
            throw new BadRequestException("Invalid image format. Supported formats: JPG, JPEG, PNG, WebP.");
        }

        String oldImageUrl = currentUser.getProfileImageUrl();

        // Upload to dedicated campussphere/profiles folder
        String newImageUrl = cloudinaryService.uploadImage(file, "campussphere/profiles");
        currentUser.setProfileImageUrl(newImageUrl);
        User saved = userRepository.save(currentUser);

        // Safely remove old asset if it was stored in user profiles folder
        if (oldImageUrl != null && !oldImageUrl.isBlank() && !oldImageUrl.equals(newImageUrl)) {
            if (oldImageUrl.contains("campussphere/profiles") || oldImageUrl.contains("uploads/campussphere_profiles")) {
                try {
                    cloudinaryService.deleteFile(oldImageUrl);
                } catch (Exception e) {
                    log.warn("Could not delete previous profile photo: {}", e.getMessage());
                }
            }
        }

        return mapToProfileDto(saved);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return mapToProfileDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> searchUsers(String query) {
        if (query == null || query.isBlank()) {
            return userRepository.findAll().stream().map(this::mapToProfileDto).collect(Collectors.toList());
        }
        return userRepository.searchUsers(query).stream().map(this::mapToProfileDto).collect(Collectors.toList());
    }

    @Transactional
    public UserProfileDto updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setRole(newRole);
        return mapToProfileDto(userRepository.save(user));
    }

    @Transactional
    public UserProfileDto toggleUserActiveStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setActive(!user.isActive());
        return mapToProfileDto(userRepository.save(user));
    }

    public UserProfileDto mapToProfileDto(User user) {
        if (user == null) return null;
        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .academicYear(user.getAcademicYear())
                .phone(user.getPhone())
                .college(user.getCollege())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .skills(user.getSkills())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserSummaryDto mapToSummaryDto(User user) {
        if (user == null) return null;
        return UserSummaryDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .academicYear(user.getAcademicYear())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
