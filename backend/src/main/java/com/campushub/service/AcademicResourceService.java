package com.campushub.service;

import com.campushub.dto.resource.AcademicResourceResponse;
import com.campushub.dto.resource.ResourceRequest;
import com.campushub.dto.resource.ResourceResponse;
import com.campushub.entity.AcademicResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AcademicResourceService {

    AcademicResourceResponse uploadResource(
            MultipartFile file,
            String title,
            String description,
            String subject,
            String department,
            Integer semester,
            String resourceType,
            String tags
    );

    ResourceResponse uploadResource(ResourceRequest request);

    List<AcademicResourceResponse> searchResources(
            String department,
            Integer semester,
            String resourceType,
            String subject,
            String query
    );

    AcademicResourceResponse getResourceById(Long id);

    AcademicResourceResponse getResourceByIdAndIncrementDownload(Long id);

    byte[] downloadResourceFile(Long id);

    AcademicResource getResourceEntity(Long id);

    AcademicResourceResponse updateResource(Long id, ResourceRequest request);

    void deleteResource(Long id);

    List<AcademicResourceResponse> getMyUploadedResources();

    AcademicResourceResponse mapToResponse(AcademicResource r);
}
