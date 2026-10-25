package com.campushub.dto.roommate;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoommateProfileRequest {

    @NotBlank(message = "Preferred location is required")
    private String preferredLocation;

    @NotBlank(message = "Budget range is required")
    private String budgetRange;

    @NotBlank(message = "Occupancy preference is required")
    private String occupancyPreference;

    private String lifestyle;
    private String studyHabits;
    private String foodPreference;
    private String sleepSchedule;
    private String interests;
    private String bio;
}
