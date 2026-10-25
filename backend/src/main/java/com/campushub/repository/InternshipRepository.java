package com.campushub.repository;

import com.campushub.entity.Internship;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.entity.Internship.WorkMode;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByStatusOrderByCreatedAtDesc(InternshipStatus status);
    List<Internship> findByPostedByOrderByCreatedAtDesc(User postedBy);

    Optional<Internship> findBySourcePlatformAndExternalId(String sourcePlatform, String externalId);
    Optional<Internship> findBySourcePlatformAndExternalUrl(String sourcePlatform, String externalUrl);
    Optional<Internship> findBySourcePlatformAndApplicationLink(String sourcePlatform, String applicationLink);
    boolean existsBySourcePlatformAndExternalId(String sourcePlatform, String externalId);
    boolean existsBySourcePlatformAndExternalUrl(String sourcePlatform, String externalUrl);
    List<Internship> findBySourcePlatformOrderByCreatedAtDesc(String sourcePlatform);

    @Query("SELECT i FROM Internship i WHERE i.status = :status AND " +
           "(:workMode IS NULL OR i.workMode = :workMode) AND " +
           "(:company IS NULL OR LOWER(i.companyName) LIKE LOWER(CONCAT('%', :company, '%'))) AND " +
           "(:sourcePlatform IS NULL OR LOWER(i.sourcePlatform) = LOWER(:sourcePlatform)) AND " +
           "(:isExternal IS NULL OR i.isExternal = :isExternal) AND " +
           "(:query IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(i.skillsRequired) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:deadlineAfter IS NULL OR i.applicationDeadline IS NULL OR i.applicationDeadline >= :deadlineAfter) " +
           "ORDER BY i.createdAt DESC")
    List<Internship> searchInternships(
            @Param("status") InternshipStatus status,
            @Param("workMode") WorkMode workMode,
            @Param("company") String company,
            @Param("query") String query,
            @Param("deadlineAfter") LocalDate deadlineAfter,
            @Param("sourcePlatform") String sourcePlatform,
            @Param("isExternal") Boolean isExternal
    );

    default List<Internship> searchInternships(
            InternshipStatus status,
            WorkMode workMode,
            String company,
            String query,
            LocalDate deadlineAfter
    ) {
        return searchInternships(status, workMode, company, query, deadlineAfter, null, null);
    }

    long countByStatus(InternshipStatus status);
}
