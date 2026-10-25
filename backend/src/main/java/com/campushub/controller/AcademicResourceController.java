package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.resource.AcademicResourceResponse;
import com.campushub.dto.resource.ResourceRequest;
import com.campushub.entity.AcademicResource;
import com.campushub.service.AcademicResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class AcademicResourceController {

    private final AcademicResourceService resourceService;

    /**
     * Upload Academic Resource (Multipart/form-data)
     * Permissions: FACULTY, ADMIN
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<AcademicResourceResponse>> uploadResourceMultipart(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("subject") String subject,
            @RequestParam("department") String department,
            @RequestParam("semester") Integer semester,
            @RequestParam("resourceType") String resourceType,
            @RequestParam(value = "tags", required = false) String tags
    ) {
        AcademicResourceResponse response = resourceService.uploadResource(
                file, title, description, subject, department, semester, resourceType, tags
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Resource uploaded successfully."));
    }

    /**
     * Upload Academic Resource (JSON Payload fallback)
     * Permissions: FACULTY, ADMIN
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<?>> uploadResourceJson(@Valid @RequestBody ResourceRequest request) {
        var response = resourceService.uploadResource(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Resource uploaded successfully."));
    }

    /**
     * Search and Filter Academic Resources
     * Permissions: Authenticated users (Students, Faculty, Admin)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AcademicResourceResponse>>> searchResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String resourceType
    ) {
        String searchQuery = (search != null && !search.isBlank()) ? search : query;
        List<AcademicResourceResponse> list = resourceService.searchResources(
                department, semester, resourceType, subject, searchQuery
        );
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Get Academic Resource Details by ID (Does NOT increment download count)
     * Permissions: Authenticated users
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicResourceResponse>> getResourceById(@PathVariable Long id) {
        AcademicResourceResponse resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success(resource));
    }

    /**
     * Download Actual Binary File
     * Permissions: Authenticated users
     * Retrieves actual bytes from Cloudinary/storage, increments download count on success,
     * returns file with original filename & Content-Disposition header.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadResourceFile(@PathVariable Long id) {
        AcademicResource resource = resourceService.getResourceEntity(id);
        byte[] fileBytes = resourceService.downloadResourceFile(id);

        String originalFileName = (resource.getFileName() != null && !resource.getFileName().isBlank())
                ? resource.getFileName()
                : "academic_resource_" + id;

        MediaType mediaType = MediaTypeFactory.getMediaType(originalFileName)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(originalFileName, StandardCharsets.UTF_8)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDisposition(disposition);
        headers.setContentLength(fileBytes.length);
        headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.set("Pragma", "no-cache");
        headers.set("Expires", "0");

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }

    /**
     * Update Resource Metadata
     * Permissions: Resource owner (FACULTY) or ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<AcademicResourceResponse>> updateResource(
            @PathVariable Long id,
            @RequestBody ResourceRequest request
    ) {
        AcademicResourceResponse updated = resourceService.updateResource(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Resource updated successfully."));
    }

    /**
     * Delete Academic Resource
     * Permissions: Resource owner (FACULTY) or ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Resource deleted successfully."));
    }

    /**
     * Get Current Faculty's Uploaded Resources
     * Permissions: FACULTY, ADMIN
     */
    @GetMapping({"/my", "/my-uploads"})
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AcademicResourceResponse>>> getMyUploadedResources() {
        List<AcademicResourceResponse> list = resourceService.getMyUploadedResources();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
