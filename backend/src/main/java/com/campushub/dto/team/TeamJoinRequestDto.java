package com.campushub.dto.team;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.TeamJoinRequest.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamJoinRequestDto {
    private Long id;
    private Long teamId;
    private String teamName;
    private UserSummaryDto user;
    private String message;
    private RequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
}
