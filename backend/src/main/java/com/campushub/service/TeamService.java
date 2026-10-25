package com.campushub.service;

import com.campushub.dto.team.TeamJoinRequestDto;
import com.campushub.dto.team.TeamMemberDto;
import com.campushub.dto.team.TeamRequest;
import com.campushub.dto.team.TeamResponse;
import com.campushub.entity.Notification.NotificationType;
import com.campushub.entity.Role;
import com.campushub.entity.Team;
import com.campushub.entity.Team.TeamStatus;
import com.campushub.entity.TeamJoinRequest;
import com.campushub.entity.TeamJoinRequest.RequestStatus;
import com.campushub.entity.TeamMember;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ConflictException;
import com.campushub.exception.ForbiddenException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.TeamJoinRequestRepository;
import com.campushub.repository.TeamMemberRepository;
import com.campushub.repository.TeamRepository;
import com.campushub.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamJoinRequestRepository joinRequestRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @Transactional
    public TeamResponse createTeam(TeamRequest request) {
        User leader = securityUtils.getCurrentUser();

        Team team = Team.builder()
                .leader(leader)
                .teamName(request.getTeamName().trim())
                .projectName(request.getProjectName().trim())
                .description(request.getDescription().trim())
                .requiredSkills(request.getRequiredSkills().trim())
                .membersRequired(request.getMembersRequired())
                .currentMembersCount(1) // Leader is member #1
                .deadline(request.getDeadline())
                .category(request.getCategory().trim())
                .status(TeamStatus.RECRUITING)
                .build();

        Team savedTeam = teamRepository.save(team);

        // Add leader as first member
        TeamMember leaderMember = TeamMember.builder()
                .team(savedTeam)
                .user(leader)
                .roleInTeam("Team Leader")
                .build();
        teamMemberRepository.save(leaderMember);

        return mapToResponse(savedTeam, leader);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> searchTeams(TeamStatus status, String category, String query) {
        User currentUser = getCurrentUserOrNull();
        List<Team> teams = teamRepository.searchTeams(status, category, query);
        return teams.stream().map(t -> mapToResponse(t, currentUser)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        return mapToResponse(team, getCurrentUserOrNull());
    }

    @Transactional
    public TeamJoinRequestDto requestToJoinTeam(Long teamId, String message) {
        User applicant = securityUtils.getCurrentUser();
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        if (team.getLeader().getId().equals(applicant.getId())) {
            throw new BadRequestException("You are the leader of this team.");
        }

        if (teamMemberRepository.existsByTeamAndUser(team, applicant)) {
            throw new ConflictException("You are already a member of this team.");
        }

        if (team.getCurrentMembersCount() >= (team.getMembersRequired() + 1)) {
            throw new BadRequestException("This team is already full.");
        }

        Optional<TeamJoinRequest> existingRequest = joinRequestRepository.findByTeamAndUser(team, applicant);
        TeamJoinRequest joinRequest;

        if (existingRequest.isPresent()) {
            joinRequest = existingRequest.get();
            if (joinRequest.getStatus() == RequestStatus.PENDING) {
                throw new ConflictException("You already have a pending join request for this team.");
            }
            joinRequest.setStatus(RequestStatus.PENDING);
            joinRequest.setMessage(message);
            joinRequest.setRespondedAt(null);
        } else {
            joinRequest = TeamJoinRequest.builder()
                    .team(team)
                    .user(applicant)
                    .message(message)
                    .status(RequestStatus.PENDING)
                    .build();
        }

        TeamJoinRequest saved = joinRequestRepository.save(joinRequest);

        // Notify Leader
        notificationService.createNotification(
                team.getLeader(),
                "New Team Join Request",
                applicant.getFullName() + " requested to join your team \"" + team.getTeamName() + "\".",
                NotificationType.TEAM_JOIN_REQUEST,
                "TEAM",
                team.getId()
        );

        return mapToJoinRequestDto(saved);
    }

    @Transactional
    public TeamJoinRequestDto respondToJoinRequest(Long teamId, Long requestId, boolean accept) {
        User leader = securityUtils.getCurrentUser();
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        if (!team.getLeader().getId().equals(leader.getId()) && leader.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the team leader can manage join requests.");
        }

        TeamJoinRequest joinRequest = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with ID: " + requestId));

        if (joinRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("This join request has already been processed.");
        }

        if (accept) {
            if (team.getCurrentMembersCount() >= (team.getMembersRequired() + 1)) {
                throw new BadRequestException("Team is already at full capacity.");
            }

            joinRequest.setStatus(RequestStatus.ACCEPTED);
            joinRequest.setRespondedAt(LocalDateTime.now());
            joinRequestRepository.save(joinRequest);

            // Add member
            TeamMember newMember = TeamMember.builder()
                    .team(team)
                    .user(joinRequest.getUser())
                    .roleInTeam("Member")
                    .build();
            teamMemberRepository.save(newMember);

            team.setCurrentMembersCount(team.getCurrentMembersCount() + 1);
            if (team.getCurrentMembersCount() >= (team.getMembersRequired() + 1)) {
                team.setStatus(TeamStatus.FULL);
            }
            teamRepository.save(team);

            // Notify Applicant
            notificationService.createNotification(
                    joinRequest.getUser(),
                    "Team Request Accepted!",
                    "You have been accepted into team \"" + team.getTeamName() + "\"!",
                    NotificationType.TEAM_REQUEST_ACCEPTED,
                    "TEAM",
                    team.getId()
            );
        } else {
            joinRequest.setStatus(RequestStatus.REJECTED);
            joinRequest.setRespondedAt(LocalDateTime.now());
            joinRequestRepository.save(joinRequest);

            // Notify Applicant
            notificationService.createNotification(
                    joinRequest.getUser(),
                    "Team Request Update",
                    "Your request to join team \"" + team.getTeamName() + "\" was not accepted at this time.",
                    NotificationType.TEAM_REQUEST_REJECTED,
                    "TEAM",
                    team.getId()
            );
        }

        return mapToJoinRequestDto(joinRequest);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getMyTeams() {
        User user = securityUtils.getCurrentUser();
        List<TeamMember> memberships = teamMemberRepository.findByUserOrderByJoinedAtDesc(user);
        return memberships.stream()
                .map(m -> mapToResponse(m.getTeam(), user))
                .collect(Collectors.toList());
    }

    private User getCurrentUserOrNull() {
        try {
            return securityUtils.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public TeamResponse mapToResponse(Team team, User currentUser) {
        boolean isLeader = false;
        boolean isMember = false;
        boolean hasRequested = false;
        List<TeamJoinRequestDto> requests = null;

        if (currentUser != null) {
            isLeader = team.getLeader().getId().equals(currentUser.getId());
            isMember = teamMemberRepository.existsByTeamAndUser(team, currentUser);
            hasRequested = joinRequestRepository.existsByTeamAndUserAndStatus(team, currentUser, RequestStatus.PENDING);

            if (isLeader || currentUser.getRole() == Role.ROLE_ADMIN) {
                requests = joinRequestRepository.findByTeamOrderByRequestedAtDesc(team).stream()
                        .map(this::mapToJoinRequestDto)
                        .collect(Collectors.toList());
            }
        }

        List<TeamMemberDto> memberList = teamMemberRepository.findByTeamOrderByJoinedAtAsc(team).stream()
                .map(this::mapToMemberDto)
                .collect(Collectors.toList());

        return TeamResponse.builder()
                .id(team.getId())
                .leader(userService.mapToSummaryDto(team.getLeader()))
                .teamName(team.getTeamName())
                .projectName(team.getProjectName())
                .description(team.getDescription())
                .requiredSkills(team.getRequiredSkills())
                .membersRequired(team.getMembersRequired())
                .currentMembersCount(team.getCurrentMembersCount())
                .deadline(team.getDeadline())
                .category(team.getCategory())
                .status(team.getStatus())
                .isUserLeader(isLeader)
                .isUserMember(isMember)
                .hasUserRequested(hasRequested)
                .members(memberList)
                .joinRequests(requests)
                .createdAt(team.getCreatedAt())
                .build();
    }

    public TeamMemberDto mapToMemberDto(TeamMember m) {
        return TeamMemberDto.builder()
                .id(m.getId())
                .user(userService.mapToSummaryDto(m.getUser()))
                .roleInTeam(m.getRoleInTeam())
                .joinedAt(m.getJoinedAt())
                .build();
    }

    public TeamJoinRequestDto mapToJoinRequestDto(TeamJoinRequest r) {
        return TeamJoinRequestDto.builder()
                .id(r.getId())
                .teamId(r.getTeam().getId())
                .teamName(r.getTeam().getTeamName())
                .user(userService.mapToSummaryDto(r.getUser()))
                .message(r.getMessage())
                .status(r.getStatus())
                .requestedAt(r.getRequestedAt())
                .respondedAt(r.getRespondedAt())
                .build();
    }
}
