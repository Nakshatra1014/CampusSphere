package com.campushub.repository;

import com.campushub.entity.AcademicResource;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicResourceRepository extends JpaRepository<AcademicResource, Long> {

    List<AcademicResource> findByUploadedByOrderByCreatedAtDesc(User uploadedBy);

    List<AcademicResource> findByUploadedByIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT r FROM AcademicResource r WHERE " +
           "(:department IS NULL OR :department = '' OR LOWER(r.department) = LOWER(:department)) AND " +
           "(:semester IS NULL OR r.semester = :semester) AND " +
           "(:resourceType IS NULL OR :resourceType = '' OR LOWER(r.resourceType) = LOWER(:resourceType)) AND " +
           "(:subject IS NULL OR :subject = '' OR LOWER(r.subject) LIKE LOWER(CONCAT('%', :subject, '%'))) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(r.subject) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(r.tags) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')) ) " +
           "ORDER BY r.createdAt DESC")
    List<AcademicResource> searchAndFilterResources(
            @Param("department") String department,
            @Param("semester") Integer semester,
            @Param("resourceType") String resourceType,
            @Param("subject") String subject,
            @Param("search") String search
    );

    @Query("SELECT r FROM AcademicResource r WHERE " +
           "(:department IS NULL OR :department = '' OR LOWER(r.department) = LOWER(:department)) AND " +
           "(:semester IS NULL OR r.semester = :semester) AND " +
           "(:resourceType IS NULL OR :resourceType = '' OR LOWER(r.resourceType) = LOWER(:resourceType)) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(r.subject) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(r.tags) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) ) " +
           "ORDER BY r.createdAt DESC")
    List<AcademicResource> searchResources(
            @Param("department") String department,
            @Param("semester") Integer semester,
            @Param("resourceType") String resourceType,
            @Param("query") String query
    );
}
