package com.campushub;

import com.campushub.dto.event.*;
import com.campushub.dto.internship.*;
import com.campushub.entity.Event;
import com.campushub.entity.Event.EventStatus;
import com.campushub.entity.EventFormField.FieldType;
import com.campushub.entity.EventRegistration;
import com.campushub.entity.EventRegistration.RegistrationStatus;
import com.campushub.entity.Internship;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.entity.Internship.WorkMode;
import com.campushub.entity.InternshipApplication;
import com.campushub.entity.InternshipApplication.ApplicationStatus;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ConflictException;
import com.campushub.exception.ForbiddenException;
import com.campushub.repository.EventRegistrationRepository;
import com.campushub.repository.EventRepository;
import com.campushub.repository.InternshipApplicationRepository;
import com.campushub.repository.InternshipRepository;
import com.campushub.repository.UserRepository;
import com.campushub.security.CustomUserDetailsService;
import com.campushub.service.EventService;
import com.campushub.service.InternshipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class EventAndInternshipBoardTests {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private InternshipService internshipService;

    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private InternshipApplicationRepository internshipApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private Clock clock;

    private void authenticateAs(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @BeforeEach
    void setup() {
        SecurityContextHolder.clearContext();
    }

    // =========================================================================
    // SECTION 22.1: EVENT MANAGEMENT TESTS
    // =========================================================================

    @Test
    @Transactional
    @DisplayName("Event Test 1 & 2: Student creates event with status PENDING, not publicly listed")
    void testStudentCreatesEventPendingAndNotPublic() {
        authenticateAs("student@campushub.edu");

        LocalDateTime now = LocalDateTime.now(clock);
        EventRequest request = EventRequest.builder()
                .title("AI Workshop 2026")
                .description("Hands-on AI modeling")
                .category("Workshop")
                .eventDate(now.toLocalDate().plusDays(5))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(17, 0))
                .venue("Lab 1")
                .eligibility("All students")
                .maxParticipants(50)
                .registrationDeadline(now.plusDays(4))
                .build();

        EventResponse created = eventService.createEventRequest(request);
        assertNotNull(created.getId());
        assertEquals(EventStatus.PENDING, created.getStatus());

        // Verify it does NOT appear in approved events listing
        List<EventResponse> approvedEvents = eventService.getApprovedEvents(null, null, null);
        boolean existsInApproved = approvedEvents.stream().anyMatch(e -> e.getId().equals(created.getId()));
        assertFalse(existsInApproved, "Pending event must not appear in public event listing");
    }

    @Test
    @Transactional
    @DisplayName("Event Test 3: Admin approves event; event becomes APPROVED and publicly visible")
    void testAdminApprovesEvent() {
        authenticateAs("faculty@campushub.edu");

        LocalDateTime now = LocalDateTime.now(clock);
        EventRequest request = EventRequest.builder()
                .title("Hackathon 2026")
                .description("Annual coding hackathon")
                .category("Hackathon")
                .eventDate(now.toLocalDate().plusDays(7))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(21, 0))
                .venue("Main Auditorium")
                .eligibility("All students")
                .maxParticipants(100)
                .registrationDeadline(now.plusDays(6))
                .build();

        EventResponse created = eventService.createEventRequest(request);
        assertEquals(EventStatus.PENDING, created.getStatus());

        // Admin approves
        authenticateAs("admin@campushub.edu");
        EventResponse approved = eventService.approveEvent(created.getId());
        assertEquals(EventStatus.APPROVED, approved.getStatus());

        // Visible in public listing
        List<EventResponse> publicList = eventService.getApprovedEvents(null, null, null);
        assertTrue(publicList.stream().anyMatch(e -> e.getId().equals(approved.getId())));
    }

    @Test
    @Transactional
    @DisplayName("Event Test 4 & 5: Registration is available before registration deadline")
    void testRegistrationAvailableBeforeDeadline() {
        authenticateAs("faculty@campushub.edu");

        LocalDateTime now = LocalDateTime.now(clock);
        EventRequest request = EventRequest.builder()
                .title("Web3 Seminar")
                .description("Intro to Blockchain")
                .category("Seminar")
                .eventDate(now.toLocalDate().plusDays(10))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(13, 0))
                .venue("Hall B")
                .eligibility("All")
                .maxParticipants(10)
                .registrationDeadline(now.plusDays(5)) // Deadline is in future
                .build();

        EventResponse created = eventService.createEventRequest(request);
        authenticateAs("admin@campushub.edu");
        EventResponse approved = eventService.approveEvent(created.getId());

        // Student registers
        authenticateAs("student@campushub.edu");
        EventRegistrationResponse reg = eventService.registerForEvent(approved.getId());
        assertNotNull(reg.getId());
        assertEquals(RegistrationStatus.REGISTERED, reg.getStatus());
    }

    @Test
    @Transactional
    @DisplayName("Event Test 6 & 7: Registration closes when deadline passes, but event remains upcoming")
    void testRegistrationClosesWhenDeadlinePassed() {
        authenticateAs("faculty@campushub.edu");

        LocalDateTime now = LocalDateTime.now(clock);
        // Event date is 5 days in future, but registration deadline is in the PAST
        Event event = Event.builder()
                .title("Past Deadline Event")
                .description("Registration already closed")
                .category("Workshop")
                .eventDate(now.toLocalDate().plusDays(5))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .venue("Lab 2")
                .eligibility("All")
                .maxParticipants(20)
                .registrationDeadline(now.minusHours(2)) // Deadline passed 2 hours ago
                .status(EventStatus.APPROVED)
                .organizer(userRepository.findByEmail("faculty@campushub.edu").orElseThrow())
                .build();
        event = eventRepository.save(event);

        // Student tries to register -> must fail
        authenticateAs("student@campushub.edu");
        final Long eventId = event.getId();
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            eventService.registerForEvent(eventId);
        });
        assertTrue(ex.getMessage().contains("Registration deadline has passed."));

        // Verify EventResponse indicates closed but remains upcoming
        EventResponse response = eventService.getEventById(eventId);
        assertFalse(response.isRegistrationOpen());
        assertEquals("CLOSED", response.getRegistrationStatus());
        assertTrue(response.getEventDate().isAfter(now.toLocalDate()), "Event remains upcoming in the future");
    }

    @Test
    @Transactional
    @DisplayName("Event Test 8: Full events reject new registrations (capacity enforcement)")
    void testFullEventsRejectRegistration() {
        authenticateAs("faculty@campushub.edu");

        LocalDateTime now = LocalDateTime.now(clock);
        Event event = Event.builder()
                .title("Micro-Workshop")
                .description("Only 1 seat")
                .category("Workshop")
                .eventDate(now.toLocalDate().plusDays(3))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .venue("Lab 5")
                .eligibility("All")
                .maxParticipants(1) // Capacity = 1
                .registrationDeadline(now.plusDays(2))
                .status(EventStatus.APPROVED)
                .organizer(userRepository.findByEmail("faculty@campushub.edu").orElseThrow())
                .build();
        event = eventRepository.save(event);

        // Student 1 registers (fills capacity to 1/1)
        authenticateAs("student@campushub.edu");
        eventService.registerForEvent(event.getId());

        // Student 2 tries to register -> capacity reached
        authenticateAs("priya.patel@campushub.edu");
        final Long eventId = event.getId();
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            eventService.registerForEvent(eventId);
        });
        assertTrue(ex.getMessage().contains("full"));
    }

    @Test
    @Transactional
    @DisplayName("Event Test 9: Duplicate registrations are prevented")
    void testDuplicateRegistrationsPrevented() {
        authenticateAs("faculty@campushub.edu");

        LocalDateTime now = LocalDateTime.now(clock);
        Event event = Event.builder()
                .title("Tech Talk")
                .description("Talk on System Design")
                .category("Seminar")
                .eventDate(now.toLocalDate().plusDays(4))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(16, 0))
                .venue("Auditorium")
                .eligibility("All")
                .maxParticipants(50)
                .registrationDeadline(now.plusDays(3))
                .status(EventStatus.APPROVED)
                .organizer(userRepository.findByEmail("faculty@campushub.edu").orElseThrow())
                .build();
        event = eventRepository.save(event);
        final Long eventId = event.getId();

        authenticateAs("student@campushub.edu");
        eventService.registerForEvent(eventId);

        // Try registering again
        assertThrows(ConflictException.class, () -> {
            eventService.registerForEvent(eventId);
        });
    }

    @Test
    @DisplayName("Event Test 10: Concurrency - Multiple simultaneous registrations cannot exceed event capacity")
    void testConcurrentRegistrationsEnforceCapacity() throws InterruptedException {
        // Prepare event with capacity 1
        authenticateAs("faculty@campushub.edu");
        LocalDateTime now = LocalDateTime.now(clock);
        Event event = Event.builder()
                .title("Exclusive Masterclass")
                .description("Only 1 lucky attendee")
                .category("Masterclass")
                .eventDate(now.toLocalDate().plusDays(4))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .venue("VIP Hall")
                .eligibility("All")
                .maxParticipants(1)
                .registrationDeadline(now.plusDays(3))
                .status(EventStatus.APPROVED)
                .organizer(userRepository.findByEmail("faculty@campushub.edu").orElseThrow())
                .build();
        event = eventRepository.save(event);
        final Long eventId = event.getId();

        // Prepare 2 users attempting to register simultaneously
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CyclicBarrier barrier = new CyclicBarrier(2);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        String[] users = {"student@campushub.edu", "priya.patel@campushub.edu"};

        for (String userEmail : users) {
            executor.submit(() -> {
                try {
                    barrier.await();
                    authenticateAs(userEmail);
                    eventService.registerForEvent(eventId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            });
        }

        executor.shutdown();
        assertTrue(executor.awaitTermination(10, TimeUnit.SECONDS));

        assertEquals(1, successCount.get(), "Exactly one user should secure the single available seat");
        assertEquals(1, failureCount.get(), "The other user should be rejected due to capacity limit");

        Event finalEvent = eventRepository.findById(eventId).orElseThrow();
        long activeCount = eventRegistrationRepository.countByEventAndStatus(finalEvent, RegistrationStatus.REGISTERED);
        assertEquals(1, activeCount);
    }

    @Test
    @Transactional
    @DisplayName("Event Test 11: Cancellation restores capacity and allows re-registration")
    void testCancellationRestoresCapacityAndReRegistration() {
        authenticateAs("faculty@campushub.edu");
        LocalDateTime now = LocalDateTime.now(clock);
        Event event = Event.builder()
                .title("Cancel Test Event")
                .description("Testing seat restore")
                .category("Workshop")
                .eventDate(now.toLocalDate().plusDays(4))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .venue("Lab 4")
                .eligibility("All")
                .maxParticipants(1)
                .registrationDeadline(now.plusDays(3))
                .status(EventStatus.APPROVED)
                .organizer(userRepository.findByEmail("faculty@campushub.edu").orElseThrow())
                .build();
        event = eventRepository.save(event);

        // Student registers
        authenticateAs("student@campushub.edu");
        eventService.registerForEvent(event.getId());

        long countAfterReg = eventRegistrationRepository.countByEventAndStatus(event, RegistrationStatus.REGISTERED);
        assertEquals(1, countAfterReg);

        // Student cancels registration
        eventService.cancelRegistration(event.getId());

        long countAfterCancel = eventRegistrationRepository.countByEventAndStatus(event, RegistrationStatus.REGISTERED);
        assertEquals(0, countAfterCancel, "Capacity must be restored by 1");

        // Reactivation: Student can re-register without creating duplicate row
        EventRegistrationResponse reactivated = eventService.registerForEvent(event.getId());
        assertEquals(RegistrationStatus.REGISTERED, reactivated.getStatus());

        long totalRows = eventRegistrationRepository.findByEventOrderByRegisteredAtAsc(event).size();
        assertEquals(1, totalRows, "Existing cancelled registration row was reactivated");
    }

    @Test
    @Transactional
    @DisplayName("Event Test 12 & 13: Organizer can view participants and custom answers; unauthorized users are blocked")
    void testOrganizerParticipantsAndCustomAnswersAccess() {
        authenticateAs("faculty@campushub.edu");
        LocalDateTime now = LocalDateTime.now(clock);
        Event event = Event.builder()
                .title("Custom Form Event")
                .description("With dynamic questions")
                .category("Workshop")
                .eventDate(now.toLocalDate().plusDays(4))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .venue("Lab 1")
                .eligibility("All")
                .maxParticipants(10)
                .registrationDeadline(now.plusDays(3))
                .status(EventStatus.APPROVED)
                .organizer(userRepository.findByEmail("faculty@campushub.edu").orElseThrow())
                .build();
        event = eventRepository.save(event);

        // Add custom form field
        EventFormFieldRequest fieldReq = EventFormFieldRequest.builder()
                .fieldLabel("GitHub Username")
                .fieldType(FieldType.TEXT)
                .required(true)
                .fieldOrder(1)
                .build();
        EventFormFieldResponse savedField = eventService.addFormField(event.getId(), fieldReq);
        assertNotNull(savedField.getId());

        // Student registers with response
        authenticateAs("student@campushub.edu");
        EventRegistrationRequest regRequest = EventRegistrationRequest.builder()
                .responses(Map.of(savedField.getId(), "octocat-student"))
                .build();
        eventService.registerForEvent(event.getId(), regRequest);

        // Organizer accesses participants
        authenticateAs("faculty@campushub.edu");
        List<EventRegistrationResponse> roster = eventService.getEventParticipants(event.getId());
        assertEquals(1, roster.size());
        assertFalse(roster.get(0).getFormResponses().isEmpty());
        assertEquals("octocat-student", roster.get(0).getFormResponses().get(0).getResponseValue());

        // Unauthorized user attempts to access participant roster
        final Long targetEventId = event.getId();
        authenticateAs("priya.patel@campushub.edu");
        assertThrows(ForbiddenException.class, () -> {
            eventService.getEventParticipants(targetEventId);
        });
    }

    @Test
    @Transactional
    @DisplayName("Event Test 14: Event cancellation preserves historical records")
    void testEventCancellationPreservesHistory() {
        authenticateAs("faculty@campushub.edu");
        LocalDateTime now = LocalDateTime.now(clock);
        Event event = Event.builder()
                .title("History Preserved Event")
                .description("Event will be cancelled")
                .category("Seminar")
                .eventDate(now.toLocalDate().plusDays(5))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 0))
                .venue("Room 101")
                .eligibility("All")
                .maxParticipants(20)
                .registrationDeadline(now.plusDays(4))
                .status(EventStatus.APPROVED)
                .organizer(userRepository.findByEmail("faculty@campushub.edu").orElseThrow())
                .build();
        event = eventRepository.save(event);

        // Student registers
        authenticateAs("student@campushub.edu");
        eventService.registerForEvent(event.getId());

        // Organizer cancels event
        authenticateAs("faculty@campushub.edu");
        EventResponse cancelled = eventService.cancelEvent(event.getId());
        assertEquals(EventStatus.CANCELLED, cancelled.getStatus());

        // Verify event and registrations still exist in database
        Event inDb = eventRepository.findById(event.getId()).orElseThrow();
        assertEquals(EventStatus.CANCELLED, inDb.getStatus());

        List<EventRegistration> regInDb = eventRegistrationRepository.findByEventOrderByRegisteredAtAsc(event);
        assertFalse(regInDb.isEmpty(), "Historical registration records must not be deleted");
    }

    // =========================================================================
    // SECTION 22.2: INTERNSHIP BOARD TESTS
    // =========================================================================

    @Test
    @Transactional
    @DisplayName("Internship Test 1: Students and Faculty can post internships")
    void testStudentsAndFacultyCanPostInternships() {
        // Faculty posts
        authenticateAs("faculty@campushub.edu");
        InternshipRequest facultyReq = InternshipRequest.builder()
                .title("AI Research Assistant")
                .companyName("AI Lab")
                .description("Research on LLMs")
                .location("Campus Lab")
                .workMode(WorkMode.HYBRID)
                .stipend("$1,000/mo")
                .duration("3 Months")
                .eligibility("All CS students")
                .skillsRequired("Python, PyTorch")
                .applicationDeadline(LocalDate.now(clock).plusDays(15))
                .build();
        InternshipResponse facultyPost = internshipService.postInternship(facultyReq);
        assertNotNull(facultyPost.getId());
        assertEquals(InternshipStatus.ACTIVE, facultyPost.getStatus());

        // Student posts
        authenticateAs("student@campushub.edu");
        InternshipRequest studentReq = InternshipRequest.builder()
                .title("Frontend Developer Intern")
                .companyName("Student Startup")
                .description("React & MUI development")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .stipend("$500/mo")
                .duration("2 Months")
                .eligibility("Any student")
                .skillsRequired("React, JavaScript")
                .applicationDeadline(LocalDate.now(clock).plusDays(20))
                .build();
        InternshipResponse studentPost = internshipService.postInternship(studentReq);
        assertNotNull(studentPost.getId());
        assertEquals(InternshipStatus.ACTIVE, studentPost.getStatus());
    }

    @Test
    @Transactional
    @DisplayName("Internship Test 2 & 3: Application open before and throughout deadline date")
    void testInternshipOpenThroughoutDeadlineDate() {
        authenticateAs("faculty@campushub.edu");
        LocalDate today = LocalDate.now(clock);

        // Deadline is TODAY
        InternshipRequest req = InternshipRequest.builder()
                .title("Backend Engineering Intern")
                .companyName("Tech Corp")
                .description("Java Spring Boot backend")
                .location("Bangalore")
                .workMode(WorkMode.ON_SITE)
                .stipend("INR 25,000/mo")
                .duration("6 Months")
                .eligibility("Pre-final and Final year")
                .skillsRequired("Java, Spring Boot")
                .applicationDeadline(today) // Deadline is today
                .build();
        InternshipResponse posted = internshipService.postInternship(req);

        // Verification: Today at current time, application must be open!
        InternshipResponse details = internshipService.getInternshipById(posted.getId());
        assertFalse(details.isExpired(), "Applications must remain open throughout the entire deadline date");
        assertEquals("OPEN", details.getApplicationStatus());

        // Student can apply successfully
        authenticateAs("student@campushub.edu");
        InternshipApplicationRequest appReq = InternshipApplicationRequest.builder()
                .resumeUrl("https://res.cloudinary.com/campushub/resumes/my_resume.pdf")
                .coverNote("Passionate backend engineer")
                .build();
        InternshipApplicationResponse app = internshipService.applyToInternship(posted.getId(), appReq);
        assertNotNull(app.getId());
        assertEquals(ApplicationStatus.APPLIED, app.getStatus());
    }

    @Test
    @Transactional
    @DisplayName("Internship Test 4 & 5: Applications close at start of following day; backend rejects post-deadline submissions")
    void testInternshipClosesAfterDeadlineAndRejectsSubmission() {
        authenticateAs("faculty@campushub.edu");
        LocalDate yesterday = LocalDate.now(clock).minusDays(1);

        Internship internship = Internship.builder()
                .title("Expired Internship")
                .companyName("Closed Corp")
                .description("Past deadline")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .stipend("INR 20,000")
                .duration("3 Months")
                .eligibility("All")
                .skillsRequired("Python")
                .applicationDeadline(yesterday) // Deadline passed yesterday
                .status(InternshipStatus.ACTIVE)
                .postedBy(userRepository.findByEmail("faculty@campushub.edu").orElseThrow())
                .build();
        internship = internshipRepository.save(internship);

        InternshipResponse response = internshipService.getInternshipById(internship.getId());
        assertTrue(response.isExpired());
        assertEquals("CLOSED", response.getApplicationStatus());

        // Student tries to apply -> Backend must reject with meaningful message
        authenticateAs("student@campushub.edu");
        final Long internshipId = internship.getId();
        InternshipApplicationRequest appReq = InternshipApplicationRequest.builder()
                .resumeUrl("https://res.cloudinary.com/campushub/resumes/my_resume.pdf")
                .coverNote("Applying late")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            internshipService.applyToInternship(internshipId, appReq);
        });
        assertTrue(ex.getMessage().contains("Application deadline has passed."));
    }

    @Test
    @Transactional
    @DisplayName("Internship Test 7: Duplicate applications are prevented")
    void testDuplicateInternshipApplicationsPrevented() {
        authenticateAs("faculty@campushub.edu");
        InternshipRequest req = InternshipRequest.builder()
                .title("Data Science Intern")
                .companyName("Analytics Lab")
                .description("ML models")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .stipend("INR 30,000")
                .duration("6 Months")
                .eligibility("All")
                .skillsRequired("Python, SQL")
                .applicationDeadline(LocalDate.now(clock).plusDays(10))
                .build();
        InternshipResponse posted = internshipService.postInternship(req);

        authenticateAs("student@campushub.edu");
        InternshipApplicationRequest appReq = InternshipApplicationRequest.builder()
                .resumeUrl("https://res.cloudinary.com/campushub/resumes/my_resume.pdf")
                .coverNote("First submission")
                .build();
        internshipService.applyToInternship(posted.getId(), appReq);

        // Second submission attempt
        assertThrows(ConflictException.class, () -> {
            internshipService.applyToInternship(posted.getId(), appReq);
        });
    }

    @Test
    @Transactional
    @DisplayName("Internship Test 8: Poster can review applicants and update status (UNDER_REVIEW, SELECTED, REJECTED)")
    void testPosterReviewsAndUpdatesStatus() {
        authenticateAs("faculty@campushub.edu");
        InternshipRequest req = InternshipRequest.builder()
                .title("Cybersecurity Intern")
                .companyName("Security Inc")
                .description("Pen testing and security audits")
                .location("Hyderabad")
                .workMode(WorkMode.ON_SITE)
                .stipend("INR 35,000")
                .duration("6 Months")
                .eligibility("All")
                .skillsRequired("Networking, Linux")
                .applicationDeadline(LocalDate.now(clock).plusDays(10))
                .build();
        InternshipResponse posted = internshipService.postInternship(req);

        // Student applies
        authenticateAs("student@campushub.edu");
        InternshipApplicationResponse app = internshipService.applyToInternship(
                posted.getId(),
                InternshipApplicationRequest.builder()
                        .resumeUrl("https://res.cloudinary.com/campushub/resumes/my_resume.pdf")
                        .coverNote("Cybersecurity enthusiast")
                        .build()
        );

        // Poster reviews applicants
        authenticateAs("faculty@campushub.edu");
        List<InternshipApplicationResponse> applications = internshipService.getApplicationsForInternship(posted.getId());
        assertEquals(1, applications.size());

        // Update to UNDER_REVIEW
        InternshipApplicationResponse underReview = internshipService.updateApplicationStatus(app.getId(), ApplicationStatus.UNDER_REVIEW);
        assertEquals(ApplicationStatus.UNDER_REVIEW, underReview.getStatus());

        // Update to SELECTED
        InternshipApplicationResponse selected = internshipService.updateApplicationStatus(app.getId(), ApplicationStatus.SELECTED);
        assertEquals(ApplicationStatus.SELECTED, selected.getStatus());
    }

    @Test
    @Transactional
    @DisplayName("Internship Test 9: Applicants can view own applications and withdraw")
    void testApplicantCanViewOwnApplicationsAndWithdraw() {
        authenticateAs("faculty@campushub.edu");
        InternshipRequest req = InternshipRequest.builder()
                .title("Mobile App Developer")
                .companyName("App Studio")
                .description("React Native development")
                .location("Remote")
                .workMode(WorkMode.REMOTE)
                .stipend("INR 20,000")
                .duration("3 Months")
                .eligibility("All")
                .skillsRequired("React Native")
                .applicationDeadline(LocalDate.now(clock).plusDays(10))
                .build();
        InternshipResponse posted = internshipService.postInternship(req);

        // Student applies
        authenticateAs("student@campushub.edu");
        InternshipApplicationResponse app = internshipService.applyToInternship(
                posted.getId(),
                InternshipApplicationRequest.builder()
                        .resumeUrl("https://res.cloudinary.com/campushub/resumes/my_resume.pdf")
                        .coverNote("Ready to work")
                        .build()
        );

        // Student views their applications
        List<InternshipApplicationResponse> myApps = internshipService.getMyApplications();
        assertTrue(myApps.stream().anyMatch(a -> a.getId().equals(app.getId())));

        // Student withdraws application
        InternshipApplicationResponse withdrawn = internshipService.withdrawApplication(app.getId());
        assertEquals(ApplicationStatus.WITHDRAWN, withdrawn.getStatus());

        // Application status is WITHDRAWN in DB
        InternshipApplication appInDb = internshipApplicationRepository.findById(app.getId()).orElseThrow();
        assertEquals(ApplicationStatus.WITHDRAWN, appInDb.getStatus());
    }

    @Test
    @Transactional
    @DisplayName("Internship Test 10: Unauthorized users cannot access private application data")
    void testUnauthorizedUserCannotAccessPrivateApplications() {
        authenticateAs("faculty@campushub.edu");
        InternshipRequest req = InternshipRequest.builder()
                .title("Confidential Research Position")
                .companyName("Gov Lab")
                .description("Sensitive data project")
                .location("Campus")
                .workMode(WorkMode.ON_SITE)
                .stipend("INR 40,000")
                .duration("6 Months")
                .eligibility("Top 10%")
                .skillsRequired("C++, Linux")
                .applicationDeadline(LocalDate.now(clock).plusDays(10))
                .build();
        InternshipResponse posted = internshipService.postInternship(req);

        // Another user tries to inspect applicants
        authenticateAs("student@campushub.edu");
        assertThrows(ForbiddenException.class, () -> {
            internshipService.getApplicationsForInternship(posted.getId());
        });
    }
}
