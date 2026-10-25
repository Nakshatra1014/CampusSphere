package com.campushub.dto.internship;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.InternshipApplication.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipApplicationResponse {
    private Long id;
    private Long internshipId;
    private String internshipTitle;
    private String companyName;
    private UserSummaryDto applicant;
    private String resumeUrl;
    private String coverNote;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private boolean isSelfReported;
}
