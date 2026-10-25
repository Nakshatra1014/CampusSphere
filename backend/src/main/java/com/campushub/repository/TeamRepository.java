package com.campushub.repository;

import com.campushub.entity.Team;
import com.campushub.entity.Team.TeamStatus;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByLeaderOrderByCreatedAtDesc(User leader);
    List<Team> findByStatusOrderByCreatedAtDesc(TeamStatus status);

    @Query("SELECT t FROM Team t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR LOWER(t.category) = LOWER(:category)) AND " +
           "(:query IS NULL OR LOWER(t.teamName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.projectName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.requiredSkills) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY t.createdAt DESC")
    List<Team> searchTeams(
            @Param("status") TeamStatus status,
            @Param("category") String category,
            @Param("query") String query
    );
}
