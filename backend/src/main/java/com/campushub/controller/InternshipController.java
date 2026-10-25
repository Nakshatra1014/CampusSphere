package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.internship.InternshipApplicationRequest;
import com.campushub.dto.internship.InternshipApplicationResponse;
import com.campushub.dto.internship.InternshipRequest;
import com.campushub.dto.internship.InternshipResponse;
import com.campushub.dto.internship.SyncStatusResponse;
import com.campushub.dto.internship.UpdateApplicationStatusRequest;
import com.campushub.entity.Internship.WorkMode;
import com.campushub.service.InternshipService;
import com.campushub.service.internship.aggregator.InternshipSyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internships")
@RequiredArgsConstructor
public class InternshipController {

    private final InternshipService internshipService;
    private final InternshipSyncService internshipSyncService;

    @PostMapping
    public ResponseEntity<ApiResponse<InternshipResponse>> postInternship(@Valid @RequestBody InternshipRequest request) {
        InternshipResponse response = internshipService.postInternship(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Internship opportunity posted successfully."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InternshipResponse>>> getInternships(
            @RequestParam(name = "workMode", required = false) String workMode,
            @RequestParam(name = "company", required = false) String company,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "activeOnly", required = false, defaultValue = "true") Boolean activeOnly,
            @RequestParam(name = "source", required = false) String source
    ) {
        List<InternshipResponse> list = internshipService.getInternships(workMode, company, search, activeOnly, source);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/sync/status")
    public ResponseEntity<ApiResponse<SyncStatusResponse>> getSyncStatus() {
        return ResponseEntity.ok(ApiResponse.success(internshipSyncService.getSyncStatus()));
    }

    @PostMapping("/sync/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SyncStatusResponse>> triggerManualSync() {
        SyncStatusResponse response = internshipSyncService.syncAll(true);
        return ResponseEntity.ok(ApiResponse.success(response, "Internshala synchronization executed."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InternshipResponse>> getInternshipById(@PathVariable("id") Long id) {
        InternshipResponse internship = internshipService.getInternshipById(id);
        return ResponseEntity.ok(ApiResponse.success(internship));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InternshipResponse>> updateInternship(
            @PathVariable("id") Long id,
            @Valid @RequestBody InternshipRequest request
    ) {
        InternshipResponse updated = internshipService.updateInternship(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Internship updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInternship(@PathVariable("id") Long id) {
        internshipService.deleteInternship(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Internship deleted successfully."));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<InternshipApplicationResponse>> applyToInternship(
            @PathVariable("id") Long id,
            @RequestBody(required = false) InternshipApplicationRequest request
    ) {
        InternshipApplicationResponse response = internshipService.applyToInternship(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Application submitted successfully."));
    }

    @PostMapping("/{id}/self-report-applied")
    public ResponseEntity<ApiResponse<InternshipApplicationResponse>> selfReportApplied(@PathVariable("id") Long id) {
        InternshipApplicationResponse response = internshipService.selfReportExternalApplication(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Internship marked as applied (self-reported)."));
    }

    @DeleteMapping("/{id}/self-report-applied")
    public ResponseEntity<ApiResponse<Void>> unmarkSelfReportApplied(@PathVariable("id") Long id) {
        internshipService.unmarkSelfReportedApplication(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Self-reported application status removed."));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<ApiResponse<List<InternshipApplicationResponse>>> getApplicationsForInternship(@PathVariable("id") Long id) {
        List<InternshipApplicationResponse> applications = internshipService.getApplicationsForInternship(id);
        return ResponseEntity.ok(ApiResponse.success(applications));
    }

    @PutMapping("/{id}/applications/{appId}/status")
    public ResponseEntity<ApiResponse<InternshipApplicationResponse>> updateApplicationStatus(
            @PathVariable("id") Long id,
            @PathVariable("appId") Long appId,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        InternshipApplicationResponse response = internshipService.updateApplicationStatus(appId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(response, "Application status updated."));
    }

    @GetMapping({"/my", "/my-posts"})
    public ResponseEntity<ApiResponse<List<InternshipResponse>>> getMyInternshipPosts() {
        List<InternshipResponse> list = internshipService.getMyInternshipPosts();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping({"/my-applications", "/applications/my"})
    public ResponseEntity<ApiResponse<List<InternshipApplicationResponse>>> getMyApplications() {
        List<InternshipApplicationResponse> list = internshipService.getMyApplications();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
