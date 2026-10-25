package com.campushub.repository;

import com.campushub.entity.Team;
import com.campushub.entity.TeamMember;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeamOrderByJoinedAtAsc(Team team);
    List<TeamMember> findByUserOrderByJoinedAtDesc(User user);
    Optional<TeamMember> findByTeamAndUser(Team team, User user);
    boolean existsByTeamAndUser(Team team, User user);
    void deleteByTeamAndUser(Team team, User user);
}
