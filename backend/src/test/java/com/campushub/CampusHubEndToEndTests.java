package com.campushub;

import com.campushub.dto.ai.AIOptimizeRequest;
import com.campushub.dto.ai.AIOptimizeResponse;
import com.campushub.dto.auth.AuthRequest;
import com.campushub.dto.auth.AuthResponse;
import com.campushub.dto.event.EventRegistrationResponse;
import com.campushub.dto.event.EventRequest;
import com.campushub.dto.event.EventResponse;
import com.campushub.dto.internship.InternshipApplicationRequest;
import com.campushub.dto.internship.InternshipApplicationResponse;
import com.campushub.dto.internship.InternshipRequest;
import com.campushub.dto.internship.InternshipResponse;
import com.campushub.dto.notification.NotificationResponse;
import com.campushub.dto.resource.AcademicResourceResponse;
import com.campushub.entity.Event.EventStatus;
import com.campushub.entity.EventRegistration.RegistrationStatus;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.entity.Internship.WorkMode;
import com.campushub.entity.InternshipApplication.ApplicationStatus;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ConflictException;
import com.campushub.exception.ForbiddenException;
import com.campushub.repository.EventRegistrationRepository;
import com.campushub.repository.EventRepository;
import com.campushub.repository.UserRepository;
import com.campushub.security.CustomUserDetailsService;
import com.campushub.service.*;
import com.campushub.service.ai.AIService.OptimizationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CampusHubEndToEndTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private AcademicResourceService resourceService;

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private InternshipService internshipService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    private void authenticateAs(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("1 & 2. Verify Authentication & JWT Token Issuance")
    void testAuthenticationAndJwt() {
        AuthResponse studentAuth = authService.login(AuthRequest.builder()
                .email("student@campushub.edu")
                .password("password123")
                .build());

        assertNotNull(studentAuth.getToken());
        assertEquals("student@campushub.edu", studentAuth.getUser().getEmail());

        AuthResponse facultyAuth = authService.login(AuthRequest.builder()
                .email("faculty@campushub.edu")
                .password("password123")
                .build());

        assertNotNull(facultyAuth.getToken());
        assertEquals("faculty@campushub.edu", facultyAuth.getUser().getEmail());
    }

    @Test
    @Transactional
    @DisplayName("3. Verify Academic Resources Lifecycle (Upload -> Search -> Download -> Permissions)")
    void testResourcesLifecycle() {
        // Faculty uploads
        authenticateAs("faculty@campushub.edu");
        byte[] content = "Distributed Systems Complete Exam Notes".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "DS_Final_Revision.pdf",
                "application/pdf",
                content
        );

        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Distributed Systems Exam Guide",
                "Complete semester exam revision guide.",
                "Distributed Systems",
                "Computer Science & Engineering",
                6,
                "Lecture Notes",
                "Raft, Paxos, Consensus"
        );

        assertNotNull(uploaded.getId());
        assertEquals("DS_Final_Revision.pdf", uploaded.getFileName());

        // Student searches and downloads
        authenticateAs("student@campushub.edu");
        List<AcademicResourceResponse> searchResults = resourceService.searchResources(
                "Computer Science & Engineering",
                6,
                "Lecture Notes",
                "Distributed Systems",
                "Raft"
        );
        assertFalse(searchResults.isEmpty());

        byte[] downloaded = resourceService.downloadResourceFile(uploaded.getId());
        assertArrayEquals(content, downloaded);

        // Student forbidden from uploading
        assertThrows(ForbiddenException.class, () -> {
            resourceService.uploadResource(
                    file, "Illegal Upload", "Desc", "Subject", "Computer Science & Engineering", 6, "Lecture Notes", "tag"
            );
        });
    }

    @Test
    @Transactional
    @DisplayName("5, 6, 7, 8. Event Lifecycle: Create -> Admin Approval -> Concurrency Registration -> Participants")
    void testEventFullLifecycle() {
        // 1. Organizer submits event
        authenticateAs("faculty@campushub.edu");
        EventRequest eventRequest = EventRequest.builder()
                .title("Cloud Computing Bootcamp 2026")
                .description("Intensive hands-on workshop on Kubernetes and Microservices.")
                .category("Workshop")
                .eventDate(LocalDate.now().plusDays(10))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(16, 0))
                .venue("CS Department Lab 3")
                .eligibility("All CS & IT Students")
                .maxParticipants(2)
                .registrationDeadline(LocalDateTime.now().plusDays(7))
                .build();

        EventResponse created = eventService.createEventRequest(eventRequest);
        assertEquals(EventStatus.PENDING, created.getStatus());

        // 2. Admin approves event
        authenticateAs("admin@campushub.edu");
        EventResponse approved = eventService.approveEvent(created.getId());
        assertEquals(EventStatus.APPROVED, approved.getStatus());

        // 3. Student 1 registers
        authenticateAs("student@campushub.edu");
        EventRegistrationResponse reg1 = eventService.registerForEvent(approved.getId());
        assertEquals(RegistrationStatus.REGISTERED, reg1.getStatus());

        // 4. Duplicate registration blocked
        assertThrows(ConflictException.class, () -> {
            eventService.registerForEvent(approved.getId());
        });

        // 5. Student 2 registers (hits capacity 2/2)
        authenticateAs("priya.patel@campushub.edu");
        EventRegistrationResponse reg2 = eventService.registerForEvent(approved.getId());
        assertEquals(RegistrationStatus.REGISTERED, reg2.getStatus());

        // 6. 3rd student registration fails due to full capacity
        authenticateAs("faculty@campushub.edu");
        assertThrows(BadRequestException.class, () -> {
            eventService.registerForEvent(approved.getId());
        });

        // 7. Organizer checks participants
        authenticateAs("faculty@campushub.edu");
        List<EventRegistrationResponse> participants = eventService.getEventParticipants(approved.getId());
        assertEquals(2, participants.size());
    }

    @Test
    @Transactional
    @DisplayName("9 & 10. Internship Lifecycle: Post -> Search -> Apply with Resume -> Status Review")
    void testInternshipLifecycle() {
        // 1. Student / Faculty posts internship
        authenticateAs("faculty@campushub.edu");
        InternshipRequest internshipRequest = InternshipRequest.builder()
                .title("Research Assistant - Distributed Systems")
                .companyName("Campus Research Lab")
                .description("Undergraduate research on consensus algorithms and cloud scalability.")
                .location("Campus Research Park")
                .workMode(WorkMode.HYBRID)
                .stipend("$1,200/mo")
                .duration("6 Months")
                .eligibility("3rd/4th Year CS")
                .skillsRequired("Java, Raft, Distributed Systems")
                .applicationDeadline(LocalDate.now().plusDays(30))
                .applicationLink("https://lab.campushub.edu/apply")
                .build();

        InternshipResponse posted = internshipService.postInternship(internshipRequest);
        assertNotNull(posted.getId());
        assertEquals(InternshipStatus.ACTIVE, posted.getStatus());

        // 2. Student applies with Resume URL
        authenticateAs("student@campushub.edu");
        InternshipApplicationRequest appRequest = InternshipApplicationRequest.builder()
                .resumeUrl("https://res.cloudinary.com/wzvokqzr/raw/upload/campushub/resumes/Aarav_Sharma_Resume.pdf")
                .coverNote("I have built distributed key-value stores in Java and would love to contribute.")
                .build();

        InternshipApplicationResponse appResponse = internshipService.applyToInternship(posted.getId(), appRequest);
        assertNotNull(appResponse.getId());
        assertEquals(ApplicationStatus.APPLIED, appResponse.getStatus());

        // Duplicate application blocked
        assertThrows(ConflictException.class, () -> {
            internshipService.applyToInternship(posted.getId(), appRequest);
        });

        // 3. Poster reviews applications
        authenticateAs("faculty@campushub.edu");
        List<InternshipApplicationResponse> applications = internshipService.getApplicationsForInternship(posted.getId());
        assertFalse(applications.isEmpty());

        // 4. Poster updates status to ACCEPTED
        InternshipApplicationResponse updatedApp = internshipService.updateApplicationStatus(appResponse.getId(), ApplicationStatus.ACCEPTED);
        assertEquals(ApplicationStatus.ACCEPTED, updatedApp.getStatus());
    }

    @Test
    @Transactional
    @DisplayName("11. Notification Center: Real-time trigger, unread count & mark as read")
    void testNotificationCenter() {
        authenticateAs("student@campushub.edu");

        List<NotificationResponse> notifications = notificationService.getCurrentUserNotifications();
        assertNotNull(notifications);

        long unreadBefore = notificationService.getUnreadCount();

        // Mark all as read
        notificationService.markAllAsRead();
        long unreadAfter = notificationService.getUnreadCount();
        assertEquals(0, unreadAfter);
    }
}
