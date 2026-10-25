package com.campushub.dto.internship;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.entity.Internship.WorkMode;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipResponse {
    private Long id;
    private UserSummaryDto postedBy;
    private String title;
    private String companyName;
    private String description;
    private String location;
    private WorkMode workMode;
    private String stipend;
    private String duration;
    private String eligibility;
    private String skillsRequired;
    private LocalDate applicationDeadline;
    private String applicationLink;
    private InternshipStatus status;
    private long totalApplications;

    @JsonIgnore
    private boolean isUserApplied;

    @JsonGetter("isUserApplied")
    public boolean isUserApplied() {
        return isUserApplied;
    }

    @JsonGetter("userApplied")
    public boolean getUserApplied() {
        return isUserApplied;
    }

    @JsonIgnore
    private boolean isSelfReported;

    @JsonGetter("isSelfReported")
    public boolean isSelfReported() {
        return isSelfReported;
    }

    @JsonGetter("selfReported")
    public boolean getSelfReported() {
        return isSelfReported;
    }

    @JsonIgnore
    private boolean isExpired;

    @JsonGetter("isExpired")
    public boolean isExpired() {
        return isExpired;
    }

    @JsonGetter("expired")
    public boolean getExpired() {
        return isExpired;
    }

    private LocalDateTime createdAt;

    // Helper status string
    private String applicationStatus; // "OPEN" or "CLOSED"

    // External Aggregation Fields
    private String sourcePlatform;
    private boolean isExternal;
    private String externalId;
    private String externalUrl;
    private LocalDateTime lastSyncedAt;
}
