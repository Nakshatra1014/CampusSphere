package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.team.TeamJoinRequestDto;
import com.campushub.dto.team.TeamRequest;
import com.campushub.dto.team.TeamResponse;
import com.campushub.entity.Team.TeamStatus;
import com.campushub.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<ApiResponse<TeamResponse>> createTeam(@Valid @RequestBody TeamRequest request) {
        TeamResponse response = teamService.createTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Team created successfully."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamResponse>>> searchTeams(
            @RequestParam(required = false) TeamStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        List<TeamResponse> list = teamService.searchTeams(status, category, search);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamResponse>> getTeamById(@PathVariable Long id) {
        TeamResponse team = teamService.getTeamById(id);
        return ResponseEntity.ok(ApiResponse.success(team));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<TeamJoinRequestDto>> requestToJoin(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String message = body != null ? body.get("message") : "";
        TeamJoinRequestDto response = teamService.requestToJoinTeam(id, message);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Join request submitted to team leader."));
    }

    @PutMapping("/{teamId}/requests/{requestId}/respond")
    public ResponseEntity<ApiResponse<TeamJoinRequestDto>> respondToRequest(
            @PathVariable Long teamId,
            @PathVariable Long requestId,
            @RequestParam boolean accept
    ) {
        TeamJoinRequestDto response = teamService.respondToJoinRequest(teamId, requestId, accept);
        String msg = accept ? "Join request accepted." : "Join request rejected.";
        return ResponseEntity.ok(ApiResponse.success(response, msg));
    }

    @GetMapping("/my-teams")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getMyTeams() {
        List<TeamResponse> list = teamService.getMyTeams();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
