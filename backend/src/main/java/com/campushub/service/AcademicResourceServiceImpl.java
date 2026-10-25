package com.campushub.service;

import com.campushub.dto.resource.AcademicResourceResponse;
import com.campushub.dto.resource.ResourceRequest;
import com.campushub.dto.resource.ResourceResponse;
import com.campushub.entity.AcademicResource;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.FileStorageException;
import com.campushub.exception.ForbiddenException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.AcademicResourceRepository;
import com.campushub.security.SecurityUtils;
import com.campushub.service.storage.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AcademicResourceServiceImpl implements AcademicResourceService {

    private final AcademicResourceRepository resourceRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final SecurityUtils securityUtils;
    private final CloudinaryService cloudinaryService;

    @Value("${app.resource.max-file-size-mb:10}")
    private int maxFileSizeMb;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "jpg", "jpeg", "png"
    );

    private static final Set<String> FORBIDDEN_EXTENSIONS = Set.of(
            "exe", "bat", "sh", "msi", "cmd", "ps1", "vbs", "dll", "jar", "bin", "js", "py", "com", "scr"
    );

    @Override
    @Transactional
    public AcademicResourceResponse uploadResource(
            MultipartFile file,
            String title,
            String description,
            String subject,
            String department,
            Integer semester,
            String resourceType,
            String tags
    ) {
        User user = securityUtils.getCurrentUser();

        // 1. Authorization: Only Faculty and Admin can upload resources
        if (user.getRole() != Role.ROLE_FACULTY && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only faculty members can upload resources.");
        }

        // 2. Field Validations
        if (title == null || title.trim().isEmpty()) {
            throw new BadRequestException("Title is required.");
        }
        if (subject == null || subject.trim().isEmpty()) {
            throw new BadRequestException("Subject is required.");
        }
        if (department == null || department.trim().isEmpty()) {
            throw new BadRequestException("Department is required.");
        }
        if (semester == null || semester < 1 || semester > 12) {
            throw new BadRequestException("Invalid semester. Semester must be between 1 and 8.");
        }
        if (resourceType == null || resourceType.trim().isEmpty()) {
            throw new BadRequestException("Resource type is required.");
        }

        // 3. File Validation
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required.");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            throw new BadRequestException("Invalid file name.");
        }

        String fileExt = extractExtension(originalFileName).toLowerCase();
        if (FORBIDDEN_EXTENSIONS.contains(fileExt) || !ALLOWED_EXTENSIONS.contains(fileExt)) {
            throw new BadRequestException("File type is not supported.");
        }

        long maxFileSizeBytes = (long) maxFileSizeMb * 1024 * 1024;
        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("File size exceeds the allowed limit.");
        }

        // 4. Upload to Cloudinary dedicated folder: campushub/resources
        String fileUrl;
        try {
            fileUrl = cloudinaryService.uploadResource(file, "campussphere/resources");
            if (fileUrl == null || fileUrl.isBlank()) {
                throw new FileStorageException("File upload failed. Please try again.");
            }
        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}", e.getMessage(), e);
            throw new FileStorageException("File upload failed. Please try again.", e);
        }

        String publicId = cloudinaryService.extractPublicIdFromUrl(fileUrl);

        AcademicResource resource = AcademicResource.builder()
                .uploadedBy(user)
                .title(title.trim())
                .description(description != null ? description.trim() : null)
                .subject(subject.trim())
                .department(department.trim())
                .semester(semester)
                .resourceType(resourceType.trim())
                .tags(tags != null ? tags.trim() : null)
                .fileUrl(fileUrl)
                .fileName(originalFileName)
                .fileSize(file.getSize())
                .publicId(publicId)
                .downloadCount(0)
                .build();

        AcademicResource saved = resourceRepository.save(resource);
        auditLogService.logAction(user, "RESOURCE_UPLOADED", "ACADEMIC_RESOURCE", saved.getId(),
                "Uploaded resource: " + saved.getTitle() + " (" + saved.getSubject() + ")");

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ResourceResponse uploadResource(ResourceRequest request) {
        User user = securityUtils.getCurrentUser();

        if (user.getRole() != Role.ROLE_FACULTY && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only faculty members can upload resources.");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) throw new BadRequestException("Title is required");
        if (request.getFileUrl() == null || request.getFileUrl().isBlank()) throw new BadRequestException("File URL is required");
        if (request.getSubject() == null || request.getSubject().isBlank()) throw new BadRequestException("Subject is required");
        if (request.getDepartment() == null || request.getDepartment().isBlank()) throw new BadRequestException("Department is required");
        if (request.getSemester() == null) throw new BadRequestException("Semester is required");
        if (request.getResourceType() == null || request.getResourceType().isBlank()) throw new BadRequestException("Resource type is required");

        String publicId = request.getPublicId() != null ? request.getPublicId() : cloudinaryService.extractPublicIdFromUrl(request.getFileUrl());

        AcademicResource resource = AcademicResource.builder()
                .uploadedBy(user)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .subject(request.getSubject().trim())
                .department(request.getDepartment().trim())
                .semester(request.getSemester())
                .resourceType(request.getResourceType().trim())
                .tags(request.getTags())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .publicId(publicId)
                .downloadCount(0)
                .build();

        AcademicResource saved = resourceRepository.save(resource);
        auditLogService.logAction(user, "RESOURCE_UPLOADED", "ACADEMIC_RESOURCE", saved.getId(),
                "Uploaded: " + saved.getTitle() + " (" + saved.getSubject() + ")");

        return mapToResourceResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicResourceResponse> searchResources(
            String department,
            Integer semester,
            String resourceType,
            String subject,
            String query
    ) {
        List<AcademicResource> list = resourceRepository.searchAndFilterResources(
                (department != null && !department.isBlank() && !"All".equalsIgnoreCase(department)) ? department : null,
                semester,
                (resourceType != null && !resourceType.isBlank() && !"All".equalsIgnoreCase(resourceType)) ? resourceType : null,
                (subject != null && !subject.isBlank() && !"All".equalsIgnoreCase(subject)) ? subject : null,
                (query != null && !query.isBlank()) ? query.trim() : null
        );

        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicResourceResponse getResourceById(Long id) {
        AcademicResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));
        return mapToResponse(resource);
    }

    @Override
    @Transactional
    public AcademicResourceResponse getResourceByIdAndIncrementDownload(Long id) {
        AcademicResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));
        resource.setDownloadCount(resource.getDownloadCount() + 1);
        AcademicResource saved = resourceRepository.save(resource);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public byte[] downloadResourceFile(Long id) {
        AcademicResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));

        if (resource.getFileUrl() == null || resource.getFileUrl().isBlank()) {
            recoverMissingCloudinaryUrl(resource);
        }

        // 1. Retrieve the actual binary file from Cloudinary or storage
        byte[] fileBytes;
        try {
            fileBytes = cloudinaryService.downloadFileBytes(resource.getFileUrl());
            if (fileBytes == null || fileBytes.length == 0) {
                throw new ResourceNotFoundException("File content not found in storage.");
            }
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to download resource id {}: {}", id, e.getMessage());
            throw new FileStorageException("Failed to download file from cloud storage.", e);
        }

        // 2. Only increment download count after successful retrieval
        resource.setDownloadCount(resource.getDownloadCount() + 1);
        resourceRepository.save(resource);

        return fileBytes;
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicResource getResourceEntity(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));
    }

    @Override
    @Transactional
    public AcademicResourceResponse updateResource(Long id, ResourceRequest request) {
        User user = securityUtils.getCurrentUser();
        AcademicResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));

        if (!resource.getUploadedBy().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You are not allowed to edit this resource.");
        }

        // 1. Update ONLY the resource metadata fields actually changed.
        // Prevent omitted request fields from overwriting existing database values with null.
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            resource.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            resource.setDescription(request.getDescription().trim());
        }
        if (request.getSubject() != null && !request.getSubject().isBlank()) {
            resource.setSubject(request.getSubject().trim());
        }
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            resource.setDepartment(request.getDepartment().trim());
        }
        if (request.getSemester() != null && request.getSemester() > 0) {
            resource.setSemester(request.getSemester());
        }
        if (request.getResourceType() != null && !request.getResourceType().isBlank()) {
            resource.setResourceType(request.getResourceType().trim());
        }
        if (request.getTags() != null) {
            resource.setTags(request.getTags().trim());
        }

        // 2. Preserve existing Cloudinary file URL, public ID, file name, and storage metadata
        // when the title or description changes. Never overwrite with null or empty values!
        if (request.getFileUrl() != null && !request.getFileUrl().isBlank()) {
            resource.setFileUrl(request.getFileUrl().trim());
        }
        if (request.getFileName() != null && !request.getFileName().isBlank()) {
            resource.setFileName(request.getFileName().trim());
        }
        if (request.getFileSize() != null && request.getFileSize() > 0) {
            resource.setFileSize(request.getFileSize());
        }
        if (request.getPublicId() != null && !request.getPublicId().isBlank()) {
            resource.setPublicId(request.getPublicId().trim());
        } else if (resource.getPublicId() == null || resource.getPublicId().isBlank()) {
            resource.setPublicId(cloudinaryService.extractPublicIdFromUrl(resource.getFileUrl()));
        }

        // 3. Safe recovery path: If a stored URL is missing in the database record,
        // investigate and recover using the existing Cloudinary asset. Never guess or fabricate URLs.
        if (resource.getFileUrl() == null || resource.getFileUrl().isBlank()) {
            recoverMissingCloudinaryUrl(resource);
        }

        AcademicResource saved = resourceRepository.save(resource);
        auditLogService.logAction(user, "RESOURCE_UPDATED", "ACADEMIC_RESOURCE", saved.getId(),
                "Updated resource metadata: " + saved.getTitle());

        return mapToResponse(saved);
    }

    private void recoverMissingCloudinaryUrl(AcademicResource resource) {
        if (resource.getFileUrl() != null && !resource.getFileUrl().isBlank()) {
            return;
        }

        log.info("Investigating missing fileUrl for academic resource id: {}", resource.getId());
        String recoveredUrl = cloudinaryService.recoverAssetUrl(resource.getPublicId(), resource.getFileName());
        if (recoveredUrl != null && !recoveredUrl.isBlank()) {
            log.info("Safely recovered Cloudinary URL for resource id {}: {}", resource.getId(), recoveredUrl);
            resource.setFileUrl(recoveredUrl);
            if (resource.getPublicId() == null || resource.getPublicId().isBlank()) {
                resource.setPublicId(cloudinaryService.extractPublicIdFromUrl(recoveredUrl));
            }
            resourceRepository.save(resource);
        } else {
            log.warn("Could not find existing Cloudinary asset for resource id {}. Will not fabricate or guess URLs.", resource.getId());
        }
    }

    @Override
    @Transactional
    public void deleteResource(Long id) {
        User user = securityUtils.getCurrentUser();
        AcademicResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));

        // Authorization: Only owner faculty or Admin
        if (!resource.getUploadedBy().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You are not allowed to delete this resource.");
        }

        // 1. Delete file from Cloudinary safely
        try {
            cloudinaryService.deleteResource(resource.getFileUrl());
        } catch (Exception e) {
            log.warn("Could not delete file from Cloudinary for resource {}: {}", id, e.getMessage());
        }

        // 2. Delete database record
        resourceRepository.delete(resource);

        auditLogService.logAction(user, "RESOURCE_DELETED", "ACADEMIC_RESOURCE", id,
                "Deleted resource: " + resource.getTitle());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicResourceResponse> getMyUploadedResources() {
        User user = securityUtils.getCurrentUser();
        return resourceRepository.findByUploadedByOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AcademicResourceResponse mapToResponse(AcademicResource r) {
        if (r.getFileUrl() == null || r.getFileUrl().isBlank()) {
            recoverMissingCloudinaryUrl(r);
        }

        String publicId = r.getPublicId();
        if (publicId == null || publicId.isBlank()) {
            publicId = cloudinaryService.extractPublicIdFromUrl(r.getFileUrl());
        }

        return AcademicResourceResponse.builder()
                .id(r.getId())
                .uploadedBy(userService.mapToSummaryDto(r.getUploadedBy()))
                .title(r.getTitle())
                .description(r.getDescription())
                .subject(r.getSubject())
                .department(r.getDepartment())
                .semester(r.getSemester())
                .resourceType(r.getResourceType())
                .tags(r.getTags())
                .fileUrl(r.getFileUrl())
                .fileName(r.getFileName())
                .fileSize(r.getFileSize())
                .publicId(publicId)
                .downloadCount(r.getDownloadCount())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private ResourceResponse mapToResourceResponse(AcademicResource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .uploadedBy(userService.mapToSummaryDto(r.getUploadedBy()))
                .title(r.getTitle())
                .description(r.getDescription())
                .subject(r.getSubject())
                .department(r.getDepartment())
                .semester(r.getSemester())
                .resourceType(r.getResourceType())
                .tags(r.getTags())
                .fileUrl(r.getFileUrl())
                .fileName(r.getFileName())
                .fileSize(r.getFileSize())
                .downloadCount(r.getDownloadCount())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
