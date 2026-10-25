package com.campushub.dto.team;

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
public class TeamMemberDto {
    private Long id;
    private UserSummaryDto user;
    private String roleInTeam;
    private LocalDateTime joinedAt;
}
