package com.campushub.dto.community;

import com.campushub.dto.user.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private Long postId;
    private UserSummaryDto author;
    private String content;
    private boolean isUserAuthor;
    private LocalDateTime createdAt;
}
