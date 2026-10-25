package com.campushub.dto.community;

import com.campushub.dto.user.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    private Long id;
    private UserSummaryDto author;
    private String title;
    private String content;
    private String category;
    private String attachmentUrl;
    private Integer likesCount;
    private Integer commentsCount;
    private boolean isUserAuthor;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
}
