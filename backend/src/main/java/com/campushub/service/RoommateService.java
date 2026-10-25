package com.campushub.service;

import com.campushub.dto.roommate.RoommateProfileRequest;
import com.campushub.dto.roommate.RoommateProfileResponse;
import com.campushub.entity.RoommateProfile;
import com.campushub.entity.User;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.RoommateProfileRepository;
import com.campushub.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoommateService {

    private final RoommateProfileRepository profileRepository;
    private final UserService userService;
    private final SecurityUtils securityUtils;

    @Transactional
    public RoommateProfileResponse createOrUpdateProfile(RoommateProfileRequest request) {
        User user = securityUtils.getCurrentUser();
        Optional<RoommateProfile> existing = profileRepository.findByUser(user);

        RoommateProfile profile;
        if (existing.isPresent()) {
            profile = existing.get();
            profile.setPreferredLocation(request.getPreferredLocation().trim());
            profile.setBudgetRange(request.getBudgetRange().trim());
            profile.setOccupancyPreference(request.getOccupancyPreference().trim());
            profile.setLifestyle(request.getLifestyle());
            profile.setStudyHabits(request.getStudyHabits());
            profile.setFoodPreference(request.getFoodPreference());
            profile.setSleepSchedule(request.getSleepSchedule());
            profile.setInterests(request.getInterests());
            profile.setBio(request.getBio());
            profile.setActive(true);
        } else {
            profile = RoommateProfile.builder()
                    .user(user)
                    .preferredLocation(request.getPreferredLocation().trim())
                    .budgetRange(request.getBudgetRange().trim())
                    .occupancyPreference(request.getOccupancyPreference().trim())
                    .lifestyle(request.getLifestyle())
                    .studyHabits(request.getStudyHabits())
                    .foodPreference(request.getFoodPreference())
                    .sleepSchedule(request.getSleepSchedule())
                    .interests(request.getInterests())
                    .bio(request.getBio())
                    .active(true)
                    .build();
        }

        RoommateProfile saved = profileRepository.save(profile);
        return mapToResponse(saved, user);
    }

    @Transactional(readOnly = true)
    public RoommateProfileResponse getMyProfile() {
        User user = securityUtils.getCurrentUser();
        return profileRepository.findByUser(user)
                .map(p -> mapToResponse(p, user))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<RoommateProfileResponse> searchProfiles(String location, String budget, String occupancy, String lifestyle, String query) {
        User currentUser = getCurrentUserOrNull();
        List<RoommateProfile> list = profileRepository.searchProfiles(location, budget, occupancy, lifestyle, query);
        return list.stream().map(p -> mapToResponse(p, currentUser)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoommateProfileResponse getProfileById(Long id) {
        RoommateProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roommate profile not found with ID: " + id));
        return mapToResponse(profile, getCurrentUserOrNull());
    }

    @Transactional
    public RoommateProfileResponse toggleActiveStatus() {
        User user = securityUtils.getCurrentUser();
        RoommateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("No roommate profile found for your account."));

        profile.setActive(!profile.isActive());
        return mapToResponse(profileRepository.save(profile), user);
    }

    private User getCurrentUserOrNull() {
        try {
            return securityUtils.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public RoommateProfileResponse mapToResponse(RoommateProfile p, User currentUser) {
        boolean isOwn = currentUser != null && p.getUser().getId().equals(currentUser.getId());
        return RoommateProfileResponse.builder()
                .id(p.getId())
                .user(userService.mapToSummaryDto(p.getUser()))
                .preferredLocation(p.getPreferredLocation())
                .budgetRange(p.getBudgetRange())
                .occupancyPreference(p.getOccupancyPreference())
                .lifestyle(p.getLifestyle())
                .studyHabits(p.getStudyHabits())
                .foodPreference(p.getFoodPreference())
                .sleepSchedule(p.getSleepSchedule())
                .interests(p.getInterests())
                .bio(p.getBio())
                .active(p.isActive())
                .isOwnProfile(isOwn)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
