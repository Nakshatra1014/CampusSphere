package com.campushub.repository;

import com.campushub.entity.RoommateProfile;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoommateProfileRepository extends JpaRepository<RoommateProfile, Long> {
    Optional<RoommateProfile> findByUser(User user);
    Optional<RoommateProfile> findByUserId(Long userId);
    boolean existsByUser(User user);
    List<RoommateProfile> findByActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT r FROM RoommateProfile r WHERE r.active = true AND " +
           "(:location IS NULL OR LOWER(r.preferredLocation) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:budget IS NULL OR r.budgetRange = :budget) AND " +
           "(:occupancy IS NULL OR r.occupancyPreference = :occupancy) AND " +
           "(:lifestyle IS NULL OR r.lifestyle = :lifestyle) AND " +
           "(:query IS NULL OR LOWER(r.bio) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.interests) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY r.createdAt DESC")
    List<RoommateProfile> searchProfiles(
            @Param("location") String location,
            @Param("budget") String budget,
            @Param("occupancy") String occupancy,
            @Param("lifestyle") String lifestyle,
            @Param("query") String query
    );
}
