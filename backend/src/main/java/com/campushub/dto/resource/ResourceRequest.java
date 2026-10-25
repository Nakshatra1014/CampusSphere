package com.campushub.dto.resource;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequest {

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
    private String publicId;
}
