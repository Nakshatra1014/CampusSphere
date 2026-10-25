package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.internship.InternshipApplicationResponse;
import com.campushub.dto.internship.UpdateApplicationStatusRequest;
import com.campushub.service.InternshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InternshipApplicationController {

    private final InternshipService internshipService;

    @PutMapping("/api/internship-applications/{id}/status")
    public ResponseEntity<ApiResponse<InternshipApplicationResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        InternshipApplicationResponse response = internshipService.updateApplicationStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(response, "Application status updated successfully."));
    }

    @PostMapping("/api/internship-applications/{id}/withdraw")
    public ResponseEntity<ApiResponse<InternshipApplicationResponse>> withdrawApplication(@PathVariable Long id) {
        InternshipApplicationResponse response = internshipService.withdrawApplication(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Application withdrawn successfully."));
    }

    @GetMapping("/api/users/me/internship-applications")
    public ResponseEntity<ApiResponse<List<InternshipApplicationResponse>>> getMyApplications() {
        List<InternshipApplicationResponse> list = internshipService.getMyApplications();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/api/internship-applications/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        byte[] bytes = internshipService.downloadResumeBytes(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume_" + id + ".pdf\"")
                .body(bytes);
    }
}
