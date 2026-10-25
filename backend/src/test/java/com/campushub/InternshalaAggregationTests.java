package com.campushub;

import com.campushub.dto.internship.InternshipApplicationRequest;
import com.campushub.dto.internship.InternshipApplicationResponse;
import com.campushub.dto.internship.InternshipResponse;
import com.campushub.dto.internship.SyncStatusResponse;
import com.campushub.entity.Internship;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.entity.Internship.WorkMode;
import com.campushub.entity.InternshipApplication;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ConflictException;
import com.campushub.repository.InternshipApplicationRepository;
import com.campushub.repository.InternshipRepository;
import com.campushub.repository.UserRepository;
import com.campushub.service.InternshipService;
import com.campushub.service.internship.aggregator.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@SpringBootTest
public class InternshalaAggregationTests {

    @Autowired
    private InternshipSyncService syncService;

    @Autowired
    private InternshipService internshipService;

    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private InternshipApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UpscrapeInternshalaProvider internshalaProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UpscrapeClient mockUpscrapeClient;

    private User studentUser;

    @BeforeEach
    void setUp() {
        Mockito.when(mockUpscrapeClient.isConfigured()).thenReturn(true);
        studentUser = userRepository.findByEmail("student@campushub.edu").orElse(null);
    }

    @Test
    @DisplayName("1. Successful API response, normalized mapping and DB persistence")
    @Transactional
    void testSuccessfulApiResponseAndMapping() throws Exception {
        String mockJson = """
        {
            "status": "completed",
            "result": [
                {
                    "id": "ishala-test-101",
                    "title": "Backend Engineering Intern",
                    "company": "NextGen Systems",
                    "company_url": "https://nextgen.io",
                    "location": "Bangalore (Work From Home)",
                    "work_from_home": true,
                    "stipend": "₹25,000 /month",
                    "duration": "6 Months",
                    "skills": ["Java", "Spring Boot", "MySQL", "REST APIs"],
                    "valid_through": "2026-12-15",
                    "url": "https://internshala.com/internship/detail/backend-intern-ishala-test-101",
                    "description": "<p>Work on scalable Spring Boot microservices and databases.</p>"
                }
            ]
        }
        """;

        Mockito.when(mockUpscrapeClient.executeCapability(eq("internshala.internships.list"), any()))
                .thenReturn(objectMapper.readTree(mockJson));

        SyncStatusResponse result = syncService.syncAll(true);

        assertEquals("SUCCESS", result.getStatus());
        assertEquals(1, result.getTotalFetched());
        assertEquals(1, result.getTotalImported());

        Optional<Internship> savedOpt = internshipRepository.findBySourcePlatformAndExternalId("INTERNSHALA", "ishala-test-101");
        assertTrue(savedOpt.isPresent(), "Aggregated internship should be persisted in database");

        Internship saved = savedOpt.get();
        assertEquals("Backend Engineering Intern", saved.getTitle());
        assertEquals("NextGen Systems", saved.getCompanyName());
        assertEquals(WorkMode.REMOTE, saved.getWorkMode());
        assertEquals("₹25,000 /month", saved.getStipend());
        assertEquals("6 Months", saved.getDuration());
        assertTrue(saved.getSkillsRequired().contains("Spring Boot"));
        assertEquals(LocalDate.of(2026, 12, 15), saved.getApplicationDeadline());
        assertTrue(saved.isExternal());
        assertEquals("INTERNSHALA", saved.getSourcePlatform());
        assertEquals("https://internshala.com/internship/detail/backend-intern-ishala-test-101", saved.getExternalUrl());
        assertFalse(saved.getDescription().contains("<p>"), "HTML tags should be sanitized from description");
    }

    @Test
    @DisplayName("2. Empty API response completes cleanly without side-effects")
    @Transactional
    void testEmptyApiResponse() throws Exception {
        String emptyJson = """
        {
            "status": "completed",
            "result": []
        }
        """;

        Mockito.when(mockUpscrapeClient.executeCapability(eq("internshala.internships.list"), any()))
                .thenReturn(objectMapper.readTree(emptyJson));

        long countBefore = internshipRepository.count();
        SyncStatusResponse result = syncService.syncAll(true);

        assertEquals("SKIPPED_OR_EMPTY", result.getStatus());
        assertEquals(0, result.getTotalFetched());
        assertEquals(0, result.getTotalImported());
        assertEquals(countBefore, internshipRepository.count(), "DB count should remain unchanged");
    }

    @Test
    @DisplayName("3. External API failure handled gracefully without crashing")
    @Transactional
    void testExternalApiFailure() {
        // Mock client returning null due to external 500 error / network failure
        Mockito.when(mockUpscrapeClient.executeCapability(eq("internshala.internships.list"), any()))
                .thenReturn(null);

        long countBefore = internshipRepository.count();
        SyncStatusResponse result = syncService.syncAll(true);

        assertEquals(0, result.getTotalFetched());
        assertEquals(0, result.getTotalImported());
        assertEquals(countBefore, internshipRepository.count(), "Existing records must remain intact upon API failure");
    }

    @Test
    @DisplayName("4. Malformed API response handled safely")
    @Transactional
    void testMalformedApiResponse() throws Exception {
        String malformedJson = """
        {
            "unexpected_root": {
                "invalid_data": true
            }
        }
        """;

        Mockito.when(mockUpscrapeClient.executeCapability(eq("internshala.internships.list"), any()))
                .thenReturn(objectMapper.readTree(malformedJson));

        SyncStatusResponse result = syncService.syncAll(true);
        assertEquals(0, result.getTotalFetched());
        assertEquals(0, result.getTotalImported());
    }

    @Test
    @DisplayName("5. Duplicate listing prevention using external ID & URL")
    @Transactional
    void testDuplicateListingPrevention() throws Exception {
        String mockJson = """
        {
            "status": "completed",
            "result": [
                {
                    "id": "ishala-dup-test-202",
                    "title": "Full Stack React Intern",
                    "company": "PixelCraft Studios",
                    "location": "Mumbai",
                    "stipend": "₹18,000 /month",
                    "url": "https://internshala.com/internship/detail/fullstack-pixelcraft-202"
                }
            ]
        }
        """;

        Mockito.when(mockUpscrapeClient.executeCapability(eq("internshala.internships.list"), any()))
                .thenReturn(objectMapper.readTree(mockJson));

        // First Sync
        SyncStatusResponse firstSync = syncService.syncAll(true);
        assertEquals(1, firstSync.getTotalImported());

        // Second Sync with same listing
        SyncStatusResponse secondSync = syncService.syncAll(true);
        assertEquals(0, secondSync.getTotalImported(), "Duplicate listing must not be re-imported");
        assertEquals(1, secondSync.getTotalUpdated(), "Existing listing should be counted as updated/refreshed");

        long matchingRecords = internshipRepository.findAll().stream()
                .filter(i -> "ishala-dup-test-202".equals(i.getExternalId()))
                .count();
        assertEquals(1, matchingRecords, "Exactly one record should exist for the deduplicated external ID");
    }

    @Test
    @DisplayName("6. Missing optional fields handled with resilient fallbacks")
    @Transactional
    void testMissingOptionalFields() throws Exception {
        String minimalJson = """
        {
            "status": "completed",
            "result": [
                {
                    "title": "Machine Learning Research Intern",
                    "url": "https://internshala.com/internship/detail/ml-research-303"
                }
            ]
        }
        """;

        Mockito.when(mockUpscrapeClient.executeCapability(eq("internshala.internships.list"), any()))
                .thenReturn(objectMapper.readTree(minimalJson));

        SyncStatusResponse result = syncService.syncAll(true);
        assertEquals(1, result.getTotalImported());

        Optional<Internship> savedOpt = internshipRepository.findBySourcePlatformAndExternalUrl("INTERNSHALA", "https://internshala.com/internship/detail/ml-research-303");
        assertTrue(savedOpt.isPresent());

        Internship saved = savedOpt.get();
        assertNotNull(saved.getApplicationDeadline(), "Fallback deadline should be assigned");
        assertNotNull(saved.getCompanyName(), "Default organization name should be set");
        assertNotNull(saved.getStipend(), "Default stipend label should be assigned");
        assertNotNull(saved.getLocation(), "Default location should be assigned");
    }

    @Test
    @DisplayName("7. Preservation of existing manually posted CampusSphere internships")
    @Transactional
    void testPreservationOfManualInternships() throws Exception {
        // Create manual CampusSphere internship
        Internship manual = Internship.builder()
                .title("Campus Library Assistant Intern")
                .companyName("University Central Library")
                .description("Internal campus opportunity managed directly by campus staff.")
                .location("Campus Main Building")
                .workMode(WorkMode.ON_SITE)
                .stipend("Work Study Credit")
                .postedBy(studentUser)
                .applicationDeadline(LocalDate.now().plusDays(20))
                .isExternal(false)
                .sourcePlatform("CAMPUSSPHERE")
                .status(InternshipStatus.ACTIVE)
                .build();
        Internship savedManual = internshipRepository.save(manual);

        // Run sync with external listings
        String mockJson = """
        {
            "status": "completed",
            "result": [
                {
                    "id": "ishala-ext-404",
                    "title": "Cybersecurity Analyst Intern",
                    "company": "SecureNet Global",
                    "location": "Remote",
                    "url": "https://internshala.com/internship/detail/cyber-404"
                }
            ]
        }
        """;
        Mockito.when(mockUpscrapeClient.executeCapability(eq("internshala.internships.list"), any()))
                .thenReturn(objectMapper.readTree(mockJson));

        syncService.syncAll(true);

        // Verify manual internship remains unchanged
        Optional<Internship> reloadedManual = internshipRepository.findById(savedManual.getId());
        assertTrue(reloadedManual.isPresent());
        assertFalse(reloadedManual.get().isExternal());
        assertEquals("CAMPUSSPHERE", reloadedManual.get().getSourcePlatform());
        assertEquals("Campus Library Assistant Intern", reloadedManual.get().getTitle());
    }

    @Test
    @DisplayName("8. External Internshala listing rejects internal resume application submission")
    @Transactional
    void testExternalInternshipApplicationRejection() {
        Internship external = Internship.builder()
                .title("Data Science Intern")
                .companyName("Analytics Co")
                .description("Apply on external site.")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .externalUrl("https://internshala.com/internship/detail/data-science-505")
                .isExternal(true)
                .sourcePlatform("INTERNSHALA")
                .status(InternshipStatus.ACTIVE)
                .applicationDeadline(LocalDate.now().plusDays(10))
                .build();
        Internship savedExternal = internshipRepository.save(external);

        // Authenticate as student
        com.campushub.security.UserPrincipal principal = com.campushub.security.UserPrincipal.create(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            internshipService.applyToInternship(savedExternal.getId(), null);
        });

        assertTrue(ex.getMessage().contains("must be submitted on Internshala directly"),
                "Should guide applicant to official external portal rather than taking internal submission");
    }

    @Test
    @DisplayName("9. Source filter returns only requested platform")
    @Transactional
    void testSourceFiltering() {
        // 1 manual
        Internship manual = Internship.builder()
                .title("Robotics Lab Research Assistant")
                .companyName("Campus Robotics Department")
                .description("Internal campus lab.")
                .location("Robotics Wing")
                .workMode(WorkMode.ON_SITE)
                .postedBy(studentUser)
                .isExternal(false)
                .sourcePlatform("CAMPUSSPHERE")
                .status(InternshipStatus.ACTIVE)
                .applicationDeadline(LocalDate.now().plusDays(15))
                .build();
        internshipRepository.save(manual);

        // 1 external
        Internship external = Internship.builder()
                .title("Cloud DevOps Intern")
                .companyName("CloudMatrix")
                .description("External posting.")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .isExternal(true)
                .sourcePlatform("INTERNSHALA")
                .status(InternshipStatus.ACTIVE)
                .applicationDeadline(LocalDate.now().plusDays(15))
                .build();
        internshipRepository.save(external);

        // Filter for Internshala
        List<InternshipResponse> ishalaOnly = internshipService.getInternships(null, null, null, false, "INTERNSHALA");
        assertTrue(ishalaOnly.stream().allMatch(i -> "INTERNSHALA".equalsIgnoreCase(i.getSourcePlatform())));

        // Filter for Internal
        List<InternshipResponse> internalOnly = internshipService.getInternships(null, null, null, false, "INTERNAL");
        assertTrue(internalOnly.stream().noneMatch(InternshipResponse::isExternal));
    }

    @Test
    @DisplayName("10. Strict HTTPS Internshala URL validator tests")
    void testStrictInternshalaUrlValidation() {
        // Valid HTTPS Internshala URLs
        assertTrue(InternshalaUrlValidator.isValidInternshalaUrl("https://internshala.com/internship/detail/software-engineer-intern"));
        assertTrue(InternshalaUrlValidator.isValidInternshalaUrl("https://internshala.com/internships"));
        assertTrue(InternshalaUrlValidator.isValidInternshalaUrl("https://trainings.internshala.com/java-course"));
        assertTrue(InternshalaUrlValidator.isValidInternshalaUrl("https://m.internshala.com/internship/detail/abc-123"));
        assertTrue(InternshalaUrlValidator.isValidInternshalaUrl("https://internshala.com:443/internships"));

        // Invalid: non-HTTPS schemes
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("http://internshala.com/internships"));
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("javascript:alert(1)"));
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("data:text/html,malicious"));
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("ftp://internshala.com/"));

        // Invalid: untrusted domains
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("https://evil-internshala.com/internships"));
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("https://internshala.com.attacker.com/internships"));
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("https://google.com/internships"));
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("https://internshala-scam.org/"));

        // Invalid: malicious userinfo or non-standard ports
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("https://user:password@internshala.com/internships"));
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("https://internshala.com:8080/internships"));

        // Invalid: null / empty
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl(null));
        assertFalse(InternshalaUrlValidator.isValidInternshalaUrl("   "));

        // Fallback & sanitization
        assertEquals("https://internshala.com/internships",
                InternshalaUrlValidator.sanitizeOrFallback("https://attacker.com/malicious"));
        assertEquals("https://internshala.com/internships",
                InternshalaUrlValidator.sanitizeOrFallback(null));
        assertEquals("https://internshala.com/internship/detail/valid-job",
                InternshalaUrlValidator.sanitizeOrFallback("http://internshala.com/internship/detail/valid-job"));
    }

    @Test
    @DisplayName("11. Direct CampusSphere internal application flow preserves resume upload and creates official record")
    @Transactional
    void testCampusSphereInternalApplicationFlow() {
        // Authenticate as student
        com.campushub.security.UserPrincipal principal = com.campushub.security.UserPrincipal.create(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        // Internal CampusSphere posting
        Internship internal = Internship.builder()
                .title("Software Development Lab Assistant")
                .companyName("Campus Innovation Hub")
                .description("Assist in campus laboratory development.")
                .location("Campus Lab 3")
                .workMode(WorkMode.ON_SITE)
                .stipend("₹10,000 /month")
                .duration("3 Months")
                .postedBy(studentUser)
                .applicationDeadline(LocalDate.now().plusDays(15))
                .isExternal(false)
                .sourcePlatform("CAMPUSSPHERE")
                .status(InternshipStatus.ACTIVE)
                .build();
        Internship savedInternal = internshipRepository.save(internal);

        InternshipApplicationRequest appReq = new InternshipApplicationRequest();
        appReq.setResumeUrl("https://res.cloudinary.com/demo/image/upload/sample_resume.pdf");
        appReq.setCoverNote("Passionate about lab software and systems.");

        InternshipApplicationResponse response = internshipService.applyToInternship(savedInternal.getId(), appReq);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("Software Development Lab Assistant", response.getInternshipTitle());
        assertEquals("https://res.cloudinary.com/demo/image/upload/sample_resume.pdf", response.getResumeUrl());
        assertEquals("Passionate about lab software and systems.", response.getCoverNote());
        assertFalse(response.isSelfReported(), "Internal application must not be self-reported");

        Optional<InternshipApplication> appRecord = applicationRepository.findById(response.getId());
        assertTrue(appRecord.isPresent());
        assertFalse(appRecord.get().isSelfReported());
        assertNotNull(appRecord.get().getResumeUrl());
    }

    @Test
    @DisplayName("12. External listing rejects internal application and never creates misleading record")
    @Transactional
    void testExternalInternshipRejectsInternalApplicationWithoutRecord() {
        com.campushub.security.UserPrincipal principal = com.campushub.security.UserPrincipal.create(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        Internship external = Internship.builder()
                .title("Cloud Infrastructure Intern")
                .companyName("MegaCloud Corp")
                .description("External posting on Internshala.")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .externalUrl("https://internshala.com/internship/detail/megacloud-123")
                .isExternal(true)
                .sourcePlatform("INTERNSHALA")
                .status(InternshipStatus.ACTIVE)
                .applicationDeadline(LocalDate.now().plusDays(20))
                .build();
        Internship savedExternal = internshipRepository.save(external);

        long appCountBefore = applicationRepository.count();

        InternshipApplicationRequest appReq = new InternshipApplicationRequest();
        appReq.setResumeUrl("https://res.cloudinary.com/demo/resume.pdf");
        appReq.setCoverNote("Attempted internal submission to external internship");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            internshipService.applyToInternship(savedExternal.getId(), appReq);
        });

        assertTrue(ex.getMessage().contains("must be submitted on Internshala directly"));
        assertEquals(appCountBefore, applicationRepository.count(),
                "Externally sourced internships must never create an internal application record");
    }

    @Test
    @DisplayName("13. Self-report external application flow creates tracked status without resume submission")
    @Transactional
    void testSelfReportExternalApplicationFlow() {
        com.campushub.security.UserPrincipal principal = com.campushub.security.UserPrincipal.create(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        Internship external = Internship.builder()
                .title("AI Prompt Engineer Intern")
                .companyName("Cognitive AI Labs")
                .description("Aggregated listing.")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .externalUrl("https://internshala.com/internship/detail/cognitive-ai-456")
                .isExternal(true)
                .sourcePlatform("INTERNSHALA")
                .status(InternshipStatus.ACTIVE)
                .applicationDeadline(LocalDate.now().plusDays(25))
                .build();
        Internship savedExternal = internshipRepository.save(external);

        // Self-report as applied
        InternshipApplicationResponse selfReported = internshipService.selfReportExternalApplication(savedExternal.getId());

        assertNotNull(selfReported);
        assertTrue(selfReported.isSelfReported(), "Should be flagged as self-reported");
        assertNull(selfReported.getResumeUrl(), "Resume URL must be null for self-reported applications");

        // Verify response mapping includes selfReported flag
        InternshipResponse internshipDto = internshipService.getInternshipById(savedExternal.getId());
        assertTrue(internshipDto.isUserApplied());
        assertTrue(internshipDto.isSelfReported());

        // Duplicate self-report attempt should throw ConflictException
        assertThrows(ConflictException.class, () -> {
            internshipService.selfReportExternalApplication(savedExternal.getId());
        });
    }

    @Test
    @DisplayName("14. Self-reporting is rejected for internal CampusSphere internships")
    @Transactional
    void testSelfReportRejectedOnInternalInternships() {
        com.campushub.security.UserPrincipal principal = com.campushub.security.UserPrincipal.create(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        Internship internal = Internship.builder()
                .title("Campus Library Archive Intern")
                .companyName("University Library")
                .description("Internal campus opportunity.")
                .location("Campus Central Library")
                .workMode(WorkMode.ON_SITE)
                .postedBy(studentUser)
                .applicationDeadline(LocalDate.now().plusDays(10))
                .isExternal(false)
                .sourcePlatform("CAMPUSSPHERE")
                .status(InternshipStatus.ACTIVE)
                .build();
        Internship savedInternal = internshipRepository.save(internal);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            internshipService.selfReportExternalApplication(savedInternal.getId());
        });

        assertTrue(ex.getMessage().contains("internal internships must be applied to directly"));
    }

    @Test
    @DisplayName("15. Unmarking self-reported application removes tracking cleanly")
    @Transactional
    void testUnmarkSelfReportedApplication() {
        com.campushub.security.UserPrincipal principal = com.campushub.security.UserPrincipal.create(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        Internship external = Internship.builder()
                .title("Web Security Intern")
                .companyName("ShieldTech")
                .description("Aggregated listing.")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .externalUrl("https://internshala.com/internship/detail/shieldtech-789")
                .isExternal(true)
                .sourcePlatform("INTERNSHALA")
                .status(InternshipStatus.ACTIVE)
                .applicationDeadline(LocalDate.now().plusDays(15))
                .build();
        Internship savedExternal = internshipRepository.save(external);

        // First, mark as self-reported applied
        internshipService.selfReportExternalApplication(savedExternal.getId());
        assertTrue(internshipService.getInternshipById(savedExternal.getId()).isUserApplied());

        // Then unmark
        internshipService.unmarkSelfReportedApplication(savedExternal.getId());
        assertFalse(internshipService.getInternshipById(savedExternal.getId()).isUserApplied(),
                "Internship should no longer be marked as applied after unmarking");
    }

    @Test
    @DisplayName("16. Upscrape standard results array parsing and isApiKeyConfigured propagation")
    void testUpscrapeResultsArrayParsingAndSyncStatusConfigured() throws Exception {
        String upscrapeResultsJson = """
        {
            "page": 1,
            "rows_completed": 1,
            "results": [
                {
                    "id": "ishala-results-999",
                    "title": "Cloud Operations Intern",
                    "company": "CloudNative Labs",
                    "company_url": "https://cloudnativelabs.io",
                    "location": "Mumbai",
                    "work_from_home": false,
                    "stipend": "₹20,000 /month",
                    "duration": "3 Months",
                    "skills": ["Kubernetes", "Docker", "AWS"],
                    "valid_through": "2026-11-30",
                    "url": "https://internshala.com/internship/detail/cloud-ops-999",
                    "description": "<p>DevOps and cloud deployment tasks.</p>"
                }
            ]
        }
        """;

        com.fasterxml.jackson.databind.JsonNode parsedNode = objectMapper.readTree(upscrapeResultsJson);
        List<InternshipListingDto> listings = internshalaProvider.parseInternshipsList(parsedNode);

        assertNotNull(listings);
        assertEquals(1, listings.size(), "Should correctly parse from standard Upscrape 'results' array");
        assertEquals("Cloud Operations Intern", listings.get(0).getTitle());
        assertEquals("CloudNative Labs", listings.get(0).getCompanyName());
        assertEquals("ishala-results-999", listings.get(0).getExternalId());

        // Check SyncStatusResponse contains isApiKeyConfigured
        SyncStatusResponse status = syncService.getSyncStatus();
        assertNotNull(status);
        assertTrue(status.isApiKeyConfigured());
    }

    @Test
    @DisplayName("17. Official Upscrape documented nested results[0].data.records parsing and field mapping")
    void testOfficialDocumentedNestedResponseParsing() throws Exception {
        String officialNestedJson = """
        {
            "status": "completed",
            "results": [
                {
                    "data": {
                        "records": [
                            {
                                "title": "Full Stack Developer Intern",
                                "stipend": "₹30,000 /month",
                                "url": "https://internshala.com/internship/detail/fullstack-intern-777",
                                "company": "InnovateAI Labs",
                                "location": "Hyderabad",
                                "duration": "6 Months",
                                "skills": ["React", "Java", "PostgreSQL"],
                                "valid_through": "2026-12-31",
                                "description": "<p>Build scalable microservices and responsive frontends.</p>"
                            },
                            {
                                "title": "Data Science Research Intern",
                                "stipend": "₹35,000 /month",
                                "url": "https://internshala.com/internship/detail/data-science-intern-888",
                                "company": "Quantum Data Corp"
                            }
                        ]
                    }
                }
            ]
        }
        """;

        com.fasterxml.jackson.databind.JsonNode parsedNode = objectMapper.readTree(officialNestedJson);
        List<InternshipListingDto> listings = internshalaProvider.parseInternshipsList(parsedNode);

        assertNotNull(listings);
        assertEquals(2, listings.size(), "Should parse both records from nested results[0].data.records");

        InternshipListingDto first = listings.get(0);
        assertEquals("Full Stack Developer Intern", first.getTitle());
        assertEquals("₹30,000 /month", first.getStipend());
        assertEquals("https://internshala.com/internship/detail/fullstack-intern-777", first.getExternalUrl());
        assertEquals("InnovateAI Labs", first.getCompanyName());
        assertEquals("Hyderabad", first.getLocation());
        assertEquals("6 Months", first.getDuration());
        assertEquals("React, Java, PostgreSQL", first.getSkillsRequired());
        assertEquals("Build scalable microservices and responsive frontends.", first.getDescription());

        // Verify second item with missing optional fields has safe defaults
        InternshipListingDto second = listings.get(1);
        assertEquals("Data Science Research Intern", second.getTitle());
        assertEquals("₹35,000 /month", second.getStipend());
        assertEquals("https://internshala.com/internship/detail/data-science-intern-888", second.getExternalUrl());
        assertEquals("Quantum Data Corp", second.getCompanyName());
        assertEquals("India (Remote / Flexible)", second.getLocation(), "Missing location should have safe fallback");
        assertEquals("Flexible Duration", second.getDuration(), "Missing duration should have safe fallback");
        assertNotNull(second.getApplicationDeadline(), "Missing deadline should have default 30-day fallback");
    }

    @Test
    @DisplayName("18. Empty results handling for nested records and empty results array")
    void testEmptyResultsHandling() throws Exception {
        String emptyNestedJson = """
        {
            "status": "completed",
            "results": [
                {
                    "data": {
                        "records": []
                    }
                }
            ]
        }
        """;

        com.fasterxml.jackson.databind.JsonNode emptyNode = objectMapper.readTree(emptyNestedJson);
        List<InternshipListingDto> emptyList = internshalaProvider.parseInternshipsList(emptyNode);
        assertNotNull(emptyList);
        assertTrue(emptyList.isEmpty(), "Empty records array should return an empty list safely without errors");

        String emptyResultsJson = """
        {
            "status": "completed",
            "results": []
        }
        """;
        com.fasterxml.jackson.databind.JsonNode emptyResNode = objectMapper.readTree(emptyResultsJson);
        List<InternshipListingDto> emptyResList = internshalaProvider.parseInternshipsList(emptyResNode);
        assertNotNull(emptyResList);
        assertTrue(emptyResList.isEmpty(), "Empty results array should return an empty list safely without errors");
    }

    @Test
    @DisplayName("19. Request payload input object conforms to official Upscrape inputs")
    void testRequestPayloadInputObjectConformsToOfficialDoc() {
        InternshipSyncOptions options = InternshipSyncOptions.builder()
                .limit(20)
                .keywords("computer science,software engineering,react development")
                .location("Bangalore")
                .remoteOnly(false)
                .build();

        Map<String, Object> input = internshalaProvider.buildInputPayload(options);

        assertNotNull(input);
        assertEquals(20, input.get("max_results"));
        assertEquals("Bangalore", input.get("location"));
        assertEquals(1, input.get("max_pages"));
        assertEquals(1, input.get("page"));

        // Verify keywords are passed as individual search terms, not a comma-separated literal
        Object keywordsObj = input.get("keywords");
        assertNotNull(keywordsObj);
        assertInstanceOf(List.class, keywordsObj);

        @SuppressWarnings("unchecked")
        List<String> terms = (List<String>) keywordsObj;
        assertEquals(3, terms.size());
        assertEquals("computer science", terms.get(0));
        assertEquals("software engineering", terms.get(1));
        assertEquals("react development", terms.get(2));
    }
}
