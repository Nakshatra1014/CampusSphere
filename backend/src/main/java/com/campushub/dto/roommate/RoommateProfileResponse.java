package com.campushub.dto.roommate;

import com.campushub.dto.user.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoommateProfileResponse {
    private Long id;
    private UserSummaryDto user;
    private String preferredLocation;
    private String budgetRange;
    private String occupancyPreference;
    private String lifestyle;
    private String studyHabits;
    private String foodPreference;
    private String sleepSchedule;
    private String interests;
    private String bio;
    private boolean active;
    private boolean isOwnProfile;
    private LocalDateTime createdAt;
}
