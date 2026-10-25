package com.campushub.repository;

import com.campushub.entity.PostComment;
import com.campushub.entity.StudentPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findByPostOrderByCreatedAtAsc(StudentPost post);
    long countByPost(StudentPost post);
    void deleteByPost(StudentPost post);
}
