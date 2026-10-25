package com.campushub;

import com.campushub.dto.auth.AuthRequest;
import com.campushub.dto.auth.AuthResponse;
import com.campushub.dto.event.EventRequest;
import com.campushub.dto.event.EventResponse;
import com.campushub.dto.event.EventRegistrationResponse;
import com.campushub.entity.Event.EventStatus;
import com.campushub.entity.EventRegistration.RegistrationStatus;
import com.campushub.exception.ConflictException;
import com.campushub.exception.ForbiddenException;
import com.campushub.repository.EventRegistrationRepository;
import com.campushub.repository.EventRepository;
import com.campushub.security.CustomUserDetailsService;
import com.campushub.service.AuthService;
import com.campushub.service.EventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class CampusHubApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    private void authenticateAs(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Verify User Login with Pre-seeded Student Credentials")
    void testStudentLogin() {
        AuthResponse response = authService.login(AuthRequest.builder()
                .email("student@campushub.edu")
                .password("password123")
                .build());

        assertNotNull(response.getToken());
        assertEquals("student@campushub.edu", response.getUser().getEmail());
    }

    @Test
    @Transactional
    @DisplayName("End-to-End Event Lifecycle: Submit (PENDING) -> Admin Approve -> Register -> Cancel -> Participant Access")
    void testEventLifecycle() {
        // 1. Student submits event request -> Status must be PENDING
        authenticateAs("student@campushub.edu");

        EventRequest request = EventRequest.builder()
                .title("AI & Robotics Symposium 2026")
                .description("Annual student research showcase on autonomous systems and generative AI.")
                .category("Symposium")
                .eventDate(LocalDate.now().plusDays(20))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(16, 0))
                .venue("Hall of Engineering")
                .eligibility("All students")
                .maxParticipants(50)
                .registrationDeadline(LocalDateTime.now().plusDays(15))
                .build();

        EventResponse created = eventService.createEventRequest(request);
        assertNotNull(created.getId());
        assertEquals(EventStatus.PENDING, created.getStatus());

        // 2. Admin approves event -> Status becomes APPROVED
        authenticateAs("admin@campushub.edu");
        EventResponse approved = eventService.approveEvent(created.getId());
        assertEquals(EventStatus.APPROVED, approved.getStatus());

        // 3. Another student registers for the approved event
        authenticateAs("priya.patel@campushub.edu");
        EventRegistrationResponse reg = eventService.registerForEvent(created.getId());
        assertEquals(RegistrationStatus.REGISTERED, reg.getStatus());

        // 4. Duplicate registration must be blocked
        assertThrows(ConflictException.class, () -> {
            eventService.registerForEvent(created.getId());
        });

        // 5. User cancels registration -> Record retained with status CANCELLED
        EventRegistrationResponse cancelled = eventService.cancelRegistration(created.getId());
        assertEquals(RegistrationStatus.CANCELLED, cancelled.getStatus());
        assertNotNull(cancelled.getCancelledAt());

        // Verify DB record still exists
        assertTrue(eventRegistrationRepository.findById(reg.getId()).isPresent());

        // 6. Organizer checks active participants -> 0 after cancellation
        authenticateAs("student@campushub.edu");
        List<EventRegistrationResponse> participants = eventService.getEventParticipants(created.getId());
        assertNotNull(participants);
        assertEquals(0, participants.size());

        // 7. Non-organizer non-admin student CANNOT view participants
        authenticateAs("priya.patel@campushub.edu");
        assertThrows(ForbiddenException.class, () -> {
            eventService.getEventParticipants(created.getId());
        });
    }
}
