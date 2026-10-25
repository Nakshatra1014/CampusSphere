package com.campushub.repository;

import com.campushub.entity.Team;
import com.campushub.entity.TeamJoinRequest;
import com.campushub.entity.TeamJoinRequest.RequestStatus;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {
    List<TeamJoinRequest> findByTeamOrderByRequestedAtDesc(Team team);
    List<TeamJoinRequest> findByTeamAndStatusOrderByRequestedAtDesc(Team team, RequestStatus status);
    List<TeamJoinRequest> findByUserOrderByRequestedAtDesc(User user);
    Optional<TeamJoinRequest> findByTeamAndUser(Team team, User user);
    boolean existsByTeamAndUserAndStatus(Team team, User user, RequestStatus status);
}
