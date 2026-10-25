package com.campushub.service;

import com.campushub.dto.community.CommentRequest;
import com.campushub.dto.community.CommentResponse;
import com.campushub.dto.community.PostRequest;
import com.campushub.dto.community.PostResponse;
import com.campushub.entity.Notification.NotificationType;
import com.campushub.entity.PostComment;
import com.campushub.entity.Role;
import com.campushub.entity.StudentPost;
import com.campushub.entity.User;
import com.campushub.exception.ForbiddenException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.PostCommentRepository;
import com.campushub.repository.StudentPostRepository;
import com.campushub.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final StudentPostRepository postRepository;
    private final PostCommentRepository commentRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @Transactional
    public PostResponse createPost(PostRequest request) {
        User author = securityUtils.getCurrentUser();

        StudentPost post = StudentPost.builder()
                .author(author)
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .category(request.getCategory().trim())
                .attachmentUrl(request.getAttachmentUrl())
                .likesCount(0)
                .commentsCount(0)
                .build();

        StudentPost saved = postRepository.save(post);
        return mapToPostResponse(saved, author);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPosts(String category, String query) {
        User currentUser = getCurrentUserOrNull();
        List<StudentPost> posts = postRepository.searchPosts(category, query);
        return posts.stream().map(p -> mapToPostResponse(p, currentUser)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        StudentPost post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with ID: " + id));
        return mapToPostResponse(post, getCurrentUserOrNull());
    }

    @Transactional
    public CommentResponse addComment(Long postId, CommentRequest request) {
        User author = securityUtils.getCurrentUser();
        StudentPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with ID: " + postId));

        PostComment comment = PostComment.builder()
                .post(post)
                .author(author)
                .content(request.getContent().trim())
                .build();

        PostComment saved = commentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        // Notify post author (if not self)
        if (!post.getAuthor().getId().equals(author.getId())) {
            notificationService.createNotification(
                    post.getAuthor(),
                    "New Comment on Your Post",
                    author.getFullName() + " commented on: \"" + post.getTitle() + "\".",
                    NotificationType.COMMUNITY_COMMENT,
                    "POST",
                    post.getId()
            );
        }

        return mapToCommentResponse(saved, author);
    }

    @Transactional
    public PostResponse likePost(Long postId) {
        User currentUser = securityUtils.getCurrentUser();
        StudentPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with ID: " + postId));

        post.setLikesCount(post.getLikesCount() + 1);
        StudentPost saved = postRepository.save(post);
        return mapToPostResponse(saved, currentUser);
    }

    @Transactional
    public void deletePost(Long postId) {
        User currentUser = securityUtils.getCurrentUser();
        StudentPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with ID: " + postId));

        if (!post.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only delete your own posts.");
        }

        commentRepository.deleteByPost(post);
        postRepository.delete(post);
    }

    private User getCurrentUserOrNull() {
        try {
            return securityUtils.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public PostResponse mapToPostResponse(StudentPost post, User currentUser) {
        boolean isAuthor = currentUser != null && post.getAuthor().getId().equals(currentUser.getId());
        List<CommentResponse> comments = commentRepository.findByPostOrderByCreatedAtAsc(post).stream()
                .map(c -> mapToCommentResponse(c, currentUser))
                .collect(Collectors.toList());

        return PostResponse.builder()
                .id(post.getId())
                .author(userService.mapToSummaryDto(post.getAuthor()))
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .attachmentUrl(post.getAttachmentUrl())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .isUserAuthor(isAuthor)
                .comments(comments)
                .createdAt(post.getCreatedAt())
                .build();
    }

    public CommentResponse mapToCommentResponse(PostComment c, User currentUser) {
        boolean isAuthor = currentUser != null && c.getAuthor().getId().equals(currentUser.getId());
        return CommentResponse.builder()
                .id(c.getId())
                .postId(c.getPost().getId())
                .author(userService.mapToSummaryDto(c.getAuthor()))
                .content(c.getContent())
                .isUserAuthor(isAuthor)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
