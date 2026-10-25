package com.campushub.service;

import com.campushub.dto.internship.InternshipApplicationRequest;
import com.campushub.dto.internship.InternshipApplicationResponse;
import com.campushub.dto.internship.InternshipRequest;
import com.campushub.dto.internship.InternshipResponse;
import com.campushub.entity.Internship;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.entity.Internship.WorkMode;
import com.campushub.entity.InternshipApplication;
import com.campushub.entity.InternshipApplication.ApplicationStatus;
import com.campushub.entity.Notification.NotificationType;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ConflictException;
import com.campushub.exception.ForbiddenException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.InternshipApplicationRepository;
import com.campushub.repository.InternshipRepository;
import com.campushub.security.SecurityUtils;
import com.campushub.service.storage.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InternshipService {

    private final InternshipRepository internshipRepository;
    private final InternshipApplicationRepository applicationRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final SecurityUtils securityUtils;
    private final CloudinaryService cloudinaryService;
    private final Clock clock;

    @Transactional
    public InternshipResponse postInternship(InternshipRequest request) {
        User user = securityUtils.getCurrentUser();

        Internship internship = Internship.builder()
                .postedBy(user)
                .title(request.getTitle().trim())
                .companyName(request.getCompanyName().trim())
                .description(request.getDescription().trim())
                .location(request.getLocation().trim())
                .workMode(request.getWorkMode())
                .stipend(request.getStipend())
                .duration(request.getDuration())
                .eligibility(request.getEligibility())
                .skillsRequired(request.getSkillsRequired())
                .applicationDeadline(request.getApplicationDeadline())
                .applicationLink(request.getApplicationLink())
                .status(InternshipStatus.ACTIVE)
                .build();

        Internship saved = internshipRepository.save(internship);
        auditLogService.logAction(user, "INTERNSHIP_CREATED", "INTERNSHIP", saved.getId(), "Posted internship: " + saved.getTitle() + " at " + saved.getCompanyName());
        return mapToResponse(saved, user);
    }

    @Transactional(readOnly = true)
    public List<InternshipResponse> getInternships(String workModeStr, String company, String query, Boolean activeOnly) {
        return getInternships(workModeStr, company, query, activeOnly, null);
    }

    @Transactional(readOnly = true)
    public List<InternshipResponse> getInternships(String workModeStr, String company, String query, Boolean activeOnly, String source) {
        WorkMode workMode = null;
        if (workModeStr != null && !workModeStr.trim().isEmpty() && !workModeStr.equalsIgnoreCase("All")) {
            try {
                workMode = WorkMode.valueOf(workModeStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.debug("Unrecognized work mode filter: {}", workModeStr);
                workMode = null;
            }
        }

        String sanitizedCompany = (company != null && !company.trim().isEmpty()) ? company.trim() : null;
        String sanitizedQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        String sourcePlatform = null;
        Boolean isExternal = null;
        if (source != null && !source.trim().isEmpty() && !source.equalsIgnoreCase("All")) {
            String s = source.trim().toUpperCase();
            if (s.equals("INTERNSHALA")) {
                sourcePlatform = "INTERNSHALA";
                isExternal = true;
            } else if (s.equals("INTERNAL") || s.equals("CAMPUSSPHERE")) {
                isExternal = false;
            }
        }

        User currentUser = getCurrentUserOrNull();

        // Applications are accepted through the entire deadline date in Asia/Kolkata
        // Therefore, internships whose deadline is today (or future) are still open today.
        LocalDate deadlineFilter = Boolean.TRUE.equals(activeOnly) ? LocalDate.now(clock) : null;
        List<Internship> list = internshipRepository.searchInternships(
                InternshipStatus.ACTIVE, workMode, sanitizedCompany, sanitizedQuery, deadlineFilter, sourcePlatform, isExternal
        );
        return list.stream().map(i -> mapToResponse(i, currentUser)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InternshipResponse getInternshipById(Long id) {
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with ID: " + id));
        return mapToResponse(internship, getCurrentUserOrNull());
    }

    @Transactional
    public InternshipResponse updateInternship(Long id, InternshipRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with ID: " + id));

        if (!internship.getPostedBy().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only edit internships you posted.");
        }

        internship.setTitle(request.getTitle().trim());
        internship.setCompanyName(request.getCompanyName().trim());
        internship.setDescription(request.getDescription().trim());
        internship.setLocation(request.getLocation().trim());
        internship.setWorkMode(request.getWorkMode());
        internship.setStipend(request.getStipend());
        internship.setDuration(request.getDuration());
        internship.setEligibility(request.getEligibility());
        internship.setSkillsRequired(request.getSkillsRequired());
        internship.setApplicationDeadline(request.getApplicationDeadline());
        internship.setApplicationLink(request.getApplicationLink());

        return mapToResponse(internshipRepository.save(internship), currentUser);
    }

    @Transactional
    public void deleteInternship(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with ID: " + id));

        if (!internship.getPostedBy().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only delete internships you posted.");
        }

        internshipRepository.delete(internship);
    }

    /**
     * Apply with JSON request
     */
    @Transactional
    public InternshipApplicationResponse applyToInternship(Long id, InternshipApplicationRequest request) {
        return processApplication(id, null, request != null ? request.getResumeUrl() : null, request != null ? request.getCoverNote() : null);
    }

    /**
     * Apply with direct resume file upload
     */
    @Transactional
    public InternshipApplicationResponse applyToInternshipWithFile(Long id, MultipartFile resumeFile, String coverNote) {
        return processApplication(id, resumeFile, null, coverNote);
    }

    @Transactional
    public InternshipApplicationResponse processApplication(Long id, MultipartFile file, String directResumeUrl, String coverNote) {
        User applicant = securityUtils.getCurrentUser();
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with ID: " + id));

        // 1. Status and external check
        if (internship.getStatus() != InternshipStatus.ACTIVE) {
            throw new BadRequestException("This internship opportunity is closed and no longer accepting applications.");
        }

        if (internship.isExternal()) {
            throw new BadRequestException("Applications for external Internshala listings must be submitted on Internshala directly.");
        }

        // 2. Critical deadline check:
        // Applications are accepted through the entire deadline date in Asia/Kolkata,
        // and close at the start of the following day.
        LocalDateTime now = LocalDateTime.now(clock);
        if (internship.getApplicationDeadline() != null) {
            LocalDateTime startOfDayAfterDeadline = internship.getApplicationDeadline().plusDays(1).atStartOfDay();
            if (!now.isBefore(startOfDayAfterDeadline)) {
                throw new BadRequestException("Application deadline has passed.");
            }
        }

        // 3. Duplicate check & reactivation handling
        Optional<InternshipApplication> existingOpt = applicationRepository.findByInternshipAndApplicant(internship, applicant);
        InternshipApplication application;

        // 4. Handle resume upload if multipart file provided
        String resumeUrl = directResumeUrl;
        if (file != null && !file.isEmpty()) {
            validateResumeFile(file);
            resumeUrl = cloudinaryService.uploadResume(file);
        }

        if (resumeUrl == null || resumeUrl.trim().isEmpty()) {
            throw new BadRequestException("A valid resume document (PDF, DOC, or DOCX) is required to apply.");
        }

        if (existingOpt.isPresent()) {
            application = existingOpt.get();
            if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
                // Reactivate withdrawn application
                application.setStatus(ApplicationStatus.APPLIED);
                application.setResumeUrl(resumeUrl.trim());
                application.setCoverNote(coverNote != null ? coverNote.trim() : null);
                application.setAppliedAt(now);
            } else {
                throw new ConflictException("You have already applied to this internship.");
            }
        } else {
            application = InternshipApplication.builder()
                    .internship(internship)
                    .applicant(applicant)
                    .resumeUrl(resumeUrl.trim())
                    .coverNote(coverNote != null ? coverNote.trim() : null)
                    .status(ApplicationStatus.APPLIED)
                    .appliedAt(now)
                    .build();
        }

        InternshipApplication saved = applicationRepository.save(application);
        auditLogService.logAction(applicant, "INTERNSHIP_APPLICATION_CREATED", "INTERNSHIP_APPLICATION", saved.getId(), "Applied to " + internship.getTitle());

        // Notify Poster
        notificationService.createNotification(
                internship.getPostedBy(),
                "New Internship Applicant",
                applicant.getFullName() + " applied to your internship posting: \"" + internship.getTitle() + "\".",
                NotificationType.INTERNSHIP_APPLIED,
                "INTERNSHIP",
                internship.getId()
        );

        return mapToApplicationResponse(saved);
    }

    private void validateResumeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file cannot be empty.");
        }

        if (file.getSize() > 20 * 1024 * 1024) { // 20 MB max
            throw new BadRequestException("Resume file size must not exceed 20 MB.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new BadRequestException("Resume file must have a valid extension (.pdf, .doc, or .docx).");
        }

        String ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!ext.equals("pdf") && !ext.equals("doc") && !ext.equals("docx")) {
            throw new BadRequestException("Only PDF, DOC, and DOCX resume formats are supported.");
        }

        // Validate content type & magic bytes
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int read = is.read(header);
            if (read >= 4) {
                if (ext.equals("pdf")) {
                    // %PDF
                    if (header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) {
                        throw new BadRequestException("Invalid PDF file structure.");
                    }
                } else if (ext.equals("docx")) {
                    // PK\x03\x04
                    if (header[0] != 0x50 || header[1] != 0x4B || header[2] != 0x03 || header[3] != 0x04) {
                        throw new BadRequestException("Invalid DOCX file structure.");
                    }
                } else if (ext.equals("doc")) {
                    // OLE header 0xD0, 0xCF, 0x11, 0xE0
                    if ((header[0] & 0xFF) != 0xD0 || (header[1] & 0xFF) != 0xCF) {
                        throw new BadRequestException("Invalid DOC file structure.");
                    }
                }
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to verify resume file integrity.");
        }
    }

    @Transactional(readOnly = true)
    public List<InternshipApplicationResponse> getApplicationsForInternship(Long internshipId) {
        User currentUser = securityUtils.getCurrentUser();
        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with ID: " + internshipId));

        if (!internship.getPostedBy().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the poster or admin can review applicants for this internship.");
        }

        return applicationRepository.findByInternshipOrderByAppliedAtDesc(internship).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InternshipApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatus newStatus) {
        User currentUser = securityUtils.getCurrentUser();
        InternshipApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Internship application not found with ID: " + applicationId));

        Internship internship = application.getInternship();
        if (!internship.getPostedBy().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the internship poster or administrator can update application status.");
        }

        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Cannot change status of a withdrawn application.");
        }

        application.setStatus(newStatus);
        InternshipApplication updated = applicationRepository.save(application);

        // Notify applicant of status update
        notificationService.createNotification(
                application.getApplicant(),
                "Internship Application Status Update",
                "Your application for \"" + internship.getTitle() + "\" at " + internship.getCompanyName() + " is now " + newStatus.name() + ".",
                NotificationType.INTERNSHIP_POSTED,
                "INTERNSHIP",
                internship.getId()
        );

        return mapToApplicationResponse(updated);
    }

    @Transactional
    public InternshipApplicationResponse selfReportExternalApplication(Long id) {
        User applicant = securityUtils.getCurrentUser();
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with ID: " + id));

        if (!internship.isExternal()) {
            throw new BadRequestException("CampusSphere internal internships must be applied to directly using the application form.");
        }

        if (internship.getStatus() != InternshipStatus.ACTIVE) {
            throw new BadRequestException("This internship opportunity is closed and no longer accepting applications.");
        }

        LocalDateTime now = LocalDateTime.now(clock);
        Optional<InternshipApplication> existingOpt = applicationRepository.findByInternshipAndApplicant(internship, applicant);
        InternshipApplication application;

        if (existingOpt.isPresent()) {
            application = existingOpt.get();
            if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
                application.setStatus(ApplicationStatus.APPLIED);
                application.setSelfReported(true);
                application.setResumeUrl(null);
                application.setCoverNote("Self-reported external application on Internshala");
                application.setAppliedAt(now);
            } else {
                throw new ConflictException("You have already marked this internship as applied.");
            }
        } else {
            application = InternshipApplication.builder()
                    .internship(internship)
                    .applicant(applicant)
                    .isSelfReported(true)
                    .resumeUrl(null)
                    .coverNote("Self-reported external application on Internshala")
                    .status(ApplicationStatus.APPLIED)
                    .appliedAt(now)
                    .build();
        }

        InternshipApplication saved = applicationRepository.save(application);
        auditLogService.logAction(applicant, "INTERNSHIP_SELF_REPORTED_APPLIED", "INTERNSHIP_APPLICATION", saved.getId(),
                "Marked self-reported application for external Internshala listing: " + internship.getTitle());

        return mapToApplicationResponse(saved);
    }

    @Transactional
    public void unmarkSelfReportedApplication(Long id) {
        User applicant = securityUtils.getCurrentUser();
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with ID: " + id));

        Optional<InternshipApplication> existingOpt = applicationRepository.findByInternshipAndApplicant(internship, applicant);
        if (existingOpt.isEmpty()) {
            throw new ResourceNotFoundException("No application record found for this internship.");
        }

        InternshipApplication app = existingOpt.get();
        if (!app.isSelfReported()) {
            throw new BadRequestException("Internal applications cannot be unmarked this way. Use the withdraw option instead.");
        }

        applicationRepository.delete(app);
        auditLogService.logAction(applicant, "INTERNSHIP_SELF_REPORT_REMOVED", "INTERNSHIP_APPLICATION", app.getId(),
                "Removed self-reported application tracking for: " + internship.getTitle());
    }

    @Transactional
    public InternshipApplicationResponse withdrawApplication(Long applicationId) {
        User currentUser = securityUtils.getCurrentUser();
        InternshipApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Internship application not found with ID: " + applicationId));

        if (!application.getApplicant().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only withdraw your own applications.");
        }

        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Application is already withdrawn.");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        InternshipApplication updated = applicationRepository.save(application);

        // Notify poster of withdrawal (if internal poster exists)
        if (application.getInternship().getPostedBy() != null) {
            notificationService.createNotification(
                    application.getInternship().getPostedBy(),
                    "Application Withdrawn",
                    currentUser.getFullName() + " withdrew their application for \"" + application.getInternship().getTitle() + "\".",
                    NotificationType.INTERNSHIP_APPLIED,
                    "INTERNSHIP",
                    application.getInternship().getId()
            );
        }

        return mapToApplicationResponse(updated);
    }

    @Transactional(readOnly = true)
    public byte[] downloadResumeBytes(Long applicationId) {
        User currentUser = securityUtils.getCurrentUser();
        InternshipApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Internship application not found with ID: " + applicationId));

        if (application.isSelfReported() || application.getResumeUrl() == null) {
            throw new BadRequestException("No resume file associated with this self-reported application.");
        }

        boolean isApplicant = application.getApplicant().getId().equals(currentUser.getId());
        boolean isPoster = application.getInternship().getPostedBy() != null && application.getInternship().getPostedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isApplicant && !isPoster && !isAdmin) {
            throw new ForbiddenException("Unauthorized to download this resume.");
        }

        return cloudinaryService.downloadFileBytes(application.getResumeUrl());
    }

    @Transactional(readOnly = true)
    public List<InternshipResponse> getMyInternshipPosts() {
        User currentUser = securityUtils.getCurrentUser();
        return internshipRepository.findByPostedByOrderByCreatedAtDesc(currentUser).stream()
                .map(i -> mapToResponse(i, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InternshipApplicationResponse> getMyApplications() {
        User currentUser = securityUtils.getCurrentUser();
        return applicationRepository.findByApplicantOrderByAppliedAtDesc(currentUser).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUserOrNull() {
        try {
            return securityUtils.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public InternshipResponse mapToResponse(Internship item, User currentUser) {
        long appsCount = applicationRepository.countByInternship(item);
        boolean isApplied = false;
        boolean isSelfReported = false;
        if (currentUser != null) {
            Optional<InternshipApplication> appOpt = applicationRepository.findByInternshipAndApplicant(item, currentUser);
            if (appOpt.isPresent() && appOpt.get().getStatus() != ApplicationStatus.WITHDRAWN) {
                isApplied = true;
                isSelfReported = appOpt.get().isSelfReported();
            }
        }

        // Applications are accepted through the entire deadline date in Asia/Kolkata
        // and close at the start of the following day
        LocalDateTime now = LocalDateTime.now(clock);
        boolean isExpired = false;
        if (item.getApplicationDeadline() != null) {
            LocalDateTime startOfDayAfterDeadline = item.getApplicationDeadline().plusDays(1).atStartOfDay();
            isExpired = !now.isBefore(startOfDayAfterDeadline);
        }

        boolean isOpen = item.getStatus() == InternshipStatus.ACTIVE && !isExpired;

        return InternshipResponse.builder()
                .id(item.getId())
                .postedBy(userService.mapToSummaryDto(item.getPostedBy()))
                .title(item.getTitle())
                .companyName(item.getCompanyName())
                .description(item.getDescription())
                .location(item.getLocation())
                .workMode(item.getWorkMode())
                .stipend(item.getStipend())
                .duration(item.getDuration())
                .eligibility(item.getEligibility())
                .skillsRequired(item.getSkillsRequired())
                .applicationDeadline(item.getApplicationDeadline())
                .applicationLink(item.getApplicationLink())
                .status(item.getStatus())
                .totalApplications(appsCount)
                .isUserApplied(isApplied)
                .isSelfReported(isSelfReported)
                .isExpired(isExpired)
                .applicationStatus(isOpen ? "OPEN" : "CLOSED")
                .createdAt(item.getCreatedAt())
                .sourcePlatform(item.getSourcePlatform() != null ? item.getSourcePlatform() : "CAMPUSSPHERE")
                .isExternal(item.isExternal())
                .externalId(item.getExternalId())
                .externalUrl(item.getExternalUrl() != null ? item.getExternalUrl() : item.getApplicationLink())
                .lastSyncedAt(item.getLastSyncedAt())
                .build();
    }

    public InternshipApplicationResponse mapToApplicationResponse(InternshipApplication app) {
        return InternshipApplicationResponse.builder()
                .id(app.getId())
                .internshipId(app.getInternship().getId())
                .internshipTitle(app.getInternship().getTitle())
                .companyName(app.getInternship().getCompanyName())
                .applicant(userService.mapToSummaryDto(app.getApplicant()))
                .resumeUrl(app.getResumeUrl())
                .coverNote(app.getCoverNote())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .isSelfReported(app.isSelfReported())
                .build();
    }
}
