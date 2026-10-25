package com.campushub.repository;

import com.campushub.entity.StudentPost;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentPostRepository extends JpaRepository<StudentPost, Long> {
    List<StudentPost> findByAuthorOrderByCreatedAtDesc(User author);
    List<StudentPost> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p FROM StudentPost p WHERE " +
           "(:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY p.createdAt DESC")
    List<StudentPost> searchPosts(
            @Param("category") String category,
            @Param("query") String query
    );
}
