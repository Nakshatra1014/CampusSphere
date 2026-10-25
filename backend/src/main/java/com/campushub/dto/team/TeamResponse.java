package com.campushub.dto.team;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.Team.TeamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamResponse {
    private Long id;
    private UserSummaryDto leader;
    private String teamName;
    private String projectName;
    private String description;
    private String requiredSkills;
    private Integer membersRequired;
    private Integer currentMembersCount;
    private LocalDate deadline;
    private String category;
    private TeamStatus status;
    private boolean isUserLeader;
    private boolean isUserMember;
    private boolean hasUserRequested;
    private List<TeamMemberDto> members;
    private List<TeamJoinRequestDto> joinRequests;
    private LocalDateTime createdAt;
}
