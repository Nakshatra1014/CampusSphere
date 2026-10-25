package com.campushub.dto.event;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.Event.EventStatus;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {
    private Long id;
    private UserSummaryDto organizer;
    private String title;
    private String description;
    private String category;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String eligibility;
    private Integer maxParticipants;
    private Long registeredCount;
    private Integer availableSeats;
    private LocalDateTime registrationDeadline;
    private String imageUrl;
    private EventStatus status;
    private String rejectionReason;

    @JsonIgnore
    private boolean isRegistrationOpen;

    @JsonGetter("isRegistrationOpen")
    public boolean isRegistrationOpen() {
        return isRegistrationOpen;
    }

    @JsonGetter("registrationOpen")
    public boolean getRegistrationOpen() {
        return isRegistrationOpen;
    }

    @JsonIgnore
    private boolean isUserRegistered;

    @JsonGetter("isUserRegistered")
    public boolean isUserRegistered() {
        return isUserRegistered;
    }

    @JsonGetter("userRegistered")
    public boolean getUserRegistered() {
        return isUserRegistered;
    }

    private Long userRegistrationId;
    private LocalDateTime createdAt;

    // Rich computed status helpers
    private String registrationStatus; // "OPEN", "CLOSED", "FULL", "UNAVAILABLE"
    private boolean isDeadlinePassed;
    private boolean isStarted;
    private boolean isFull;
    private boolean hasCustomForm;
}
