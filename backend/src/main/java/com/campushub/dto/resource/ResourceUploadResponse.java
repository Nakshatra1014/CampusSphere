package com.campushub.dto.resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceUploadResponse {
    private Long id;
    private String title;
    private String subject;
    private String department;
    private Integer semester;
    private String resourceType;
    private String fileName;
    private Long fileSize;
    private String fileUrl;
    private LocalDateTime createdAt;
    private String message;
}
