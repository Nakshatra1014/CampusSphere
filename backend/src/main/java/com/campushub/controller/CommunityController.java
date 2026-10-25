package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.community.CommentRequest;
import com.campushub.dto.community.CommentResponse;
import com.campushub.dto.community.PostRequest;
import com.campushub.dto.community.PostResponse;
import com.campushub.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping("/posts")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody PostRequest request) {
        PostResponse response = communityService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Community post published successfully."));
    }

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        List<PostResponse> list = communityService.getPosts(category, search);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long id) {
        PostResponse post = communityService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request
    ) {
        CommentResponse comment = communityService.addComment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(comment, "Comment added successfully."));
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<ApiResponse<PostResponse>> likePost(@PathVariable Long id) {
        PostResponse response = communityService.likePost(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Post liked."));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        communityService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Post deleted successfully."));
    }
}
