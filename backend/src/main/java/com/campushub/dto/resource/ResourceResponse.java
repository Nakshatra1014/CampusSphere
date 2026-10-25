package com.campushub.dto.resource;

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
public class ResourceResponse {
    private Long id;
    private UserSummaryDto uploadedBy;
    private String title;
    private String description;
    private String subject;
    private String department;
    private Integer semester;
    private String resourceType;
    private String tags;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Integer downloadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
