package com.campushub.dto.event;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.EventRegistration.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistrationResponse {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String eventCategory;
    private String eventVenue;
    private String eventDate;
    private String eventTime;
    private UserSummaryDto participant;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime cancelledAt;
    private java.util.List<EventFormResponseDto> formResponses;
}
