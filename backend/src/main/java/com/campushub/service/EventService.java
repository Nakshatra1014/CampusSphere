package com.campushub.service;

import com.campushub.dto.event.*;
import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.Event;
import com.campushub.entity.Event.EventStatus;
import com.campushub.entity.EventFormField;
import com.campushub.entity.EventFormResponse;
import com.campushub.entity.EventRegistration;
import com.campushub.entity.EventRegistration.RegistrationStatus;
import com.campushub.entity.Notification.NotificationType;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ConflictException;
import com.campushub.exception.ForbiddenException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.EventFormFieldRepository;
import com.campushub.repository.EventFormResponseRepository;
import com.campushub.repository.EventRegistrationRepository;
import com.campushub.repository.EventRepository;
import com.campushub.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventFormFieldRepository eventFormFieldRepository;
    private final EventFormResponseRepository eventFormResponseRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final SecurityUtils securityUtils;
    private final Clock clock;

    @Transactional
    public EventResponse createEventRequest(EventRequest request) {
        User organizer = securityUtils.getCurrentUser();

        // Validation
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new BadRequestException("Event end time must follow start time.");
        }
        if (request.getMaxParticipants() == null || request.getMaxParticipants() <= 0) {
            throw new BadRequestException("Maximum participants count must be greater than zero.");
        }

        LocalDateTime eventStart = LocalDateTime.of(request.getEventDate(), request.getStartTime());
        if (request.getRegistrationDeadline().isAfter(eventStart)) {
            throw new BadRequestException("Registration deadline cannot be after the event begins.");
        }

        Event event = Event.builder()
                .organizer(organizer)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory().trim())
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .venue(request.getVenue().trim())
                .eligibility(request.getEligibility())
                .maxParticipants(request.getMaxParticipants())
                .registrationDeadline(request.getRegistrationDeadline())
                .imageUrl(request.getImageUrl())
                .status(EventStatus.PENDING) // Always starts PENDING
                .build();

        Event saved = eventRepository.save(event);

        auditLogService.logAction(organizer, "EVENT_CREATED", "EVENT", saved.getId(), "Submitted event: " + saved.getTitle());

        // Notify Admins
        notificationService.notifyAllAdmins(
                "New Event Approval Request",
                "Organizer " + organizer.getFullName() + " submitted an event request: \"" + saved.getTitle() + "\".",
                NotificationType.EVENT_SUBMITTED,
                "EVENT",
                saved.getId()
        );

        return mapToEventResponse(saved, organizer);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getApprovedEvents(String category, String query, LocalDate fromDate) {
        String sanitizedCategory = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All"))
                ? category.trim()
                : null;
        String sanitizedQuery = (query != null && !query.trim().isEmpty())
                ? query.trim()
                : null;

        User currentUser = getCurrentUserOrNull();
        List<Event> events = eventRepository.searchApprovedEvents(EventStatus.APPROVED, sanitizedCategory, sanitizedQuery, fromDate);
        return events.stream().map(e -> mapToEventResponse(e, currentUser)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        User currentUser = getCurrentUserOrNull();

        // If not approved, only organizer or admin can view
        if (event.getStatus() != EventStatus.APPROVED) {
            if (currentUser == null || (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN)) {
                throw new ForbiddenException("This event is currently pending approval or is not published.");
            }
        }

        return mapToEventResponse(event, currentUser);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getPendingEvents() {
        return eventRepository.findByStatus(EventStatus.PENDING).stream()
                .map(e -> mapToEventResponse(e, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getMyOrganizedEvents() {
        User organizer = securityUtils.getCurrentUser();
        return eventRepository.findByOrganizerOrderByCreatedAtDesc(organizer).stream()
                .map(e -> mapToEventResponse(e, organizer))
                .collect(Collectors.toList());
    }

    @Transactional
    public EventResponse updateEvent(Long eventId, EventRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only edit events you organized.");
        }

        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new BadRequestException("Event end time must follow start time.");
        }
        if (request.getMaxParticipants() == null || request.getMaxParticipants() <= 0) {
            throw new BadRequestException("Maximum participants count must be greater than zero.");
        }

        LocalDateTime eventStart = LocalDateTime.of(request.getEventDate(), request.getStartTime());
        if (request.getRegistrationDeadline().isAfter(eventStart)) {
            throw new BadRequestException("Registration deadline cannot be after the event begins.");
        }

        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription().trim());
        event.setCategory(request.getCategory().trim());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setVenue(request.getVenue().trim());
        event.setEligibility(request.getEligibility());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setRegistrationDeadline(request.getRegistrationDeadline());
        if (request.getImageUrl() != null) {
            event.setImageUrl(request.getImageUrl());
        }

        Event updated = eventRepository.save(event);
        return mapToEventResponse(updated, currentUser);
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only delete events you organized.");
        }

        eventRepository.delete(event);
    }

    @Transactional
    public EventResponse approveEvent(Long eventId) {
        User admin = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        event.setStatus(EventStatus.APPROVED);
        event.setRejectionReason(null);
        Event updated = eventRepository.save(event);

        auditLogService.logAction(admin, "EVENT_APPROVED", "EVENT", event.getId(), "Approved event: " + event.getTitle());

        notificationService.createNotification(
                event.getOrganizer(),
                "Event Approved!",
                "Your event \"" + event.getTitle() + "\" has been approved and published to the campus.",
                NotificationType.EVENT_APPROVED,
                "EVENT",
                event.getId()
        );

        return mapToEventResponse(updated, admin);
    }

    @Transactional
    public EventResponse rejectEvent(Long eventId, String reason) {
        User admin = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        event.setStatus(EventStatus.REJECTED);
        event.setRejectionReason(reason);
        Event updated = eventRepository.save(event);

        auditLogService.logAction(admin, "EVENT_REJECTED", "EVENT", event.getId(), "Rejected event: " + event.getTitle() + ". Reason: " + reason);

        notificationService.createNotification(
                event.getOrganizer(),
                "Event Request Declined",
                "Your event request \"" + event.getTitle() + "\" was not approved. Reason: " + reason,
                NotificationType.EVENT_REJECTED,
                "EVENT",
                event.getId()
        );

        return mapToEventResponse(updated, admin);
    }

    @Transactional
    public EventResponse cancelEvent(Long eventId) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the organizer or an admin can cancel this event.");
        }

        event.setStatus(EventStatus.CANCELLED);
        Event updated = eventRepository.save(event);

        auditLogService.logAction(currentUser, "EVENT_CANCELLED", "EVENT", event.getId(), "Cancelled event: " + event.getTitle());

        // Notify all registered participants
        List<EventRegistration> registrations = eventRegistrationRepository.findByEventAndStatusOrderByRegisteredAtAsc(event, RegistrationStatus.REGISTERED);
        for (EventRegistration reg : registrations) {
            notificationService.createNotification(
                    reg.getUser(),
                    "Event Cancelled",
                    "The event \"" + event.getTitle() + "\" scheduled for " + event.getEventDate() + " has been cancelled.",
                    NotificationType.EVENT_CANCELLED,
                    "EVENT",
                    event.getId()
            );
        }

        return mapToEventResponse(updated, currentUser);
    }

    /**
     * Backward-compatible simple registration method
     */
    @Transactional
    public EventRegistrationResponse registerForEvent(Long eventId) {
        return registerForEvent(eventId, null);
    }

    /**
     * Concurrency-safe event registration with dynamic custom form responses
     */
    @Transactional
    public EventRegistrationResponse registerForEvent(Long eventId, EventRegistrationRequest request) {
        User user = securityUtils.getCurrentUser();

        // 1. Acquire DB lock on event row to serialize concurrent registrations
        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        LocalDateTime now = LocalDateTime.now(clock);
        LocalDateTime eventStart = LocalDateTime.of(event.getEventDate(), event.getStartTime());

        // Validation 1: Event must be APPROVED
        if (event.getStatus() != EventStatus.APPROVED) {
            throw new BadRequestException("Event registration is unavailable because the event is not approved.");
        }

        // Validation 2: Registration deadline check (current time strictly before registration deadline)
        if (event.getRegistrationDeadline() != null && !now.isBefore(event.getRegistrationDeadline())) {
            throw new BadRequestException("Registration deadline has passed.");
        }

        // Validation 3: Event has not started
        if (!now.isBefore(eventStart)) {
            throw new BadRequestException("Event registration is closed because the event has already started.");
        }

        // Validation 4: Capacity check
        long currentRegisteredCount = eventRegistrationRepository.countByEventAndStatus(event, RegistrationStatus.REGISTERED);
        if (currentRegisteredCount >= event.getMaxParticipants()) {
            throw new BadRequestException("Event registration is full.");
        }

        // Validation 5: Custom Form Required Fields Validation
        List<EventFormField> formFields = eventFormFieldRepository.findByEventOrderByFieldOrderAsc(event);
        Map<Long, String> responseMap = (request != null && request.getResponses() != null) ? request.getResponses() : Map.of();
        for (EventFormField field : formFields) {
            String submittedVal = responseMap.get(field.getId());
            if (field.isRequired() && (submittedVal == null || submittedVal.trim().isEmpty())) {
                throw new BadRequestException("Required question \"" + field.getFieldLabel() + "\" must be answered.");
            }
        }

        // Validation 6: Duplicate registration check & reactivation
        Optional<EventRegistration> existingReg = eventRegistrationRepository.findByEventAndUser(event, user);
        EventRegistration registration;

        if (existingReg.isPresent()) {
            registration = existingReg.get();
            if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                throw new ConflictException("You are already registered for this event.");
            } else {
                // Re-activate previously cancelled registration
                registration.setStatus(RegistrationStatus.REGISTERED);
                registration.setCancelledAt(null);
                registration.setRegisteredAt(now);
            }
        } else {
            registration = EventRegistration.builder()
                    .event(event)
                    .user(user)
                    .status(RegistrationStatus.REGISTERED)
                    .registeredAt(now)
                    .build();
        }

        EventRegistration saved = eventRegistrationRepository.save(registration);

        // Save form responses
        eventFormResponseRepository.deleteByRegistration(saved);
        List<EventFormResponseDto> savedResponsesDto = new ArrayList<>();
        for (EventFormField field : formFields) {
            String val = responseMap.get(field.getId());
            if (val != null && !val.trim().isEmpty()) {
                EventFormResponse formResp = eventFormResponseRepository.save(EventFormResponse.builder()
                        .registration(saved)
                        .formField(field)
                        .responseValue(val.trim())
                        .build());
                savedResponsesDto.add(EventFormResponseDto.builder()
                        .fieldId(field.getId())
                        .fieldLabel(field.getFieldLabel())
                        .fieldType(field.getFieldType())
                        .responseValue(formResp.getResponseValue())
                        .build());
            }
        }

        // Notify user
        notificationService.createNotification(
                user,
                "Event Registration Confirmed",
                "You are successfully registered for \"" + event.getTitle() + "\" on " + event.getEventDate() + " at " + event.getVenue() + ".",
                NotificationType.EVENT_REGISTERED,
                "EVENT",
                event.getId()
        );

        // Notify organizer
        notificationService.createNotification(
                event.getOrganizer(),
                "New Event Registration",
                user.getFullName() + " registered for \"" + event.getTitle() + "\".",
                NotificationType.EVENT_REGISTERED,
                "EVENT",
                event.getId()
        );

        EventRegistrationResponse response = mapToRegistrationResponse(saved);
        response.setFormResponses(savedResponsesDto);
        return response;
    }

    @Transactional
    public EventRegistrationResponse cancelRegistration(Long eventId) {
        User user = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        EventRegistration registration = eventRegistrationRepository.findByEventAndUser(event, user)
                .orElseThrow(() -> new ResourceNotFoundException("No registration record found for this event."));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new BadRequestException("Registration is already cancelled.");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(LocalDateTime.now(clock));
        EventRegistration updated = eventRegistrationRepository.save(registration);

        notificationService.createNotification(
                user,
                "Registration Cancelled",
                "Your registration for \"" + event.getTitle() + "\" has been cancelled.",
                NotificationType.EVENT_REGISTRATION_CANCELLED,
                "EVENT",
                event.getId()
        );

        notificationService.createNotification(
                event.getOrganizer(),
                "Registration Cancelled",
                user.getFullName() + " cancelled their registration for \"" + event.getTitle() + "\". A seat was restored.",
                NotificationType.EVENT_REGISTRATION_CANCELLED,
                "EVENT",
                event.getId()
        );

        return mapToRegistrationResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getMyRegistrations() {
        User user = securityUtils.getCurrentUser();
        return eventRegistrationRepository.findByUserOrderByRegisteredAtDesc(user).stream()
                .map(this::mapToRegistrationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getEventParticipants(Long eventId) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        // Organizer or Admin only
        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the event organizer or platform admin can view the participant roster.");
        }

        List<EventRegistration> registrations = eventRegistrationRepository.findByEventAndStatusOrderByRegisteredAtAsc(event, RegistrationStatus.REGISTERED);
        return registrations.stream().map(this::mapToRegistrationResponse).collect(Collectors.toList());
    }

    // -------------------------------------------------------------
    // Form Builder Management
    // -------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<EventFormFieldResponse> getEventFormFields(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        return eventFormFieldRepository.findByEventOrderByFieldOrderAsc(event).stream()
                .map(this::mapToFormFieldResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EventFormFieldResponse addFormField(Long eventId, EventFormFieldRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the event organizer or administrator can configure form fields.");
        }

        EventFormField field = EventFormField.builder()
                .event(event)
                .fieldLabel(request.getFieldLabel().trim())
                .fieldType(request.getFieldType())
                .required(request.isRequired())
                .fieldOrder(request.getFieldOrder() != null ? request.getFieldOrder() : 0)
                .options(request.getOptions())
                .build();

        return mapToFormFieldResponse(eventFormFieldRepository.save(field));
    }

    @Transactional
    public EventFormFieldResponse updateFormField(Long eventId, Long fieldId, EventFormFieldRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the event organizer or administrator can configure form fields.");
        }

        EventFormField field = eventFormFieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Form field not found with ID: " + fieldId));

        if (!field.getEvent().getId().equals(eventId)) {
            throw new BadRequestException("Form field does not belong to the specified event.");
        }

        field.setFieldLabel(request.getFieldLabel().trim());
        field.setFieldType(request.getFieldType());
        field.setRequired(request.isRequired());
        if (request.getFieldOrder() != null) {
            field.setFieldOrder(request.getFieldOrder());
        }
        field.setOptions(request.getOptions());

        return mapToFormFieldResponse(eventFormFieldRepository.save(field));
    }

    @Transactional
    public void deleteFormField(Long eventId, Long fieldId) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));

        if (!event.getOrganizer().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the event organizer or administrator can delete form fields.");
        }

        EventFormField field = eventFormFieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Form field not found with ID: " + fieldId));

        if (!field.getEvent().getId().equals(eventId)) {
            throw new BadRequestException("Form field does not belong to the specified event.");
        }

        eventFormFieldRepository.delete(field);
    }

    /**
     * Automatic event lifecycle completion maintenance job
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void markEndedEventsAsCompleted() {
        LocalDateTime now = LocalDateTime.now(clock);
        List<Event> approvedEvents = eventRepository.findByStatus(EventStatus.APPROVED);
        for (Event evt : approvedEvents) {
            LocalDateTime eventEnd = LocalDateTime.of(evt.getEventDate(), evt.getEndTime());
            if (!now.isBefore(eventEnd)) {
                evt.setStatus(EventStatus.COMPLETED);
                eventRepository.save(evt);
                log.info("Marked ended event #{} ({}) as COMPLETED.", evt.getId(), evt.getTitle());
            }
        }
    }

    private User getCurrentUserOrNull() {
        try {
            return securityUtils.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public EventResponse mapToEventResponse(Event event, User currentUser) {
        LocalDateTime now = LocalDateTime.now(clock);

        // Check if event has ended and should be computed/marked as COMPLETED
        LocalDateTime eventEnd = LocalDateTime.of(event.getEventDate(), event.getEndTime());
        if (event.getStatus() == EventStatus.APPROVED && !now.isBefore(eventEnd)) {
            event.setStatus(EventStatus.COMPLETED);
            eventRepository.save(event);
        }

        long currentRegistrations = eventRegistrationRepository.countByEventAndStatus(event, RegistrationStatus.REGISTERED);
        boolean isRegistered = false;
        Long userRegistrationId = null;
        if (currentUser != null) {
            Optional<EventRegistration> reg = eventRegistrationRepository.findByEventAndUser(event, currentUser);
            if (reg.isPresent() && reg.get().getStatus() == RegistrationStatus.REGISTERED) {
                isRegistered = true;
                userRegistrationId = reg.get().getId();
            }
        }

        LocalDateTime eventStart = LocalDateTime.of(event.getEventDate(), event.getStartTime());
        // Registration is closed if now >= registrationDeadline
        boolean isDeadlinePassed = event.getRegistrationDeadline() != null && (!now.isBefore(event.getRegistrationDeadline()));
        // Registration is closed if event has started
        boolean isStarted = !now.isBefore(eventStart);
        // Event full check
        boolean isFull = currentRegistrations >= event.getMaxParticipants();
        boolean isApproved = event.getStatus() == EventStatus.APPROVED;

        boolean isRegistrationOpen = isApproved && !isDeadlinePassed && !isStarted && !isFull;

        String regStatus;
        if (!isApproved) {
            regStatus = "UNAVAILABLE";
        } else if (isDeadlinePassed || isStarted) {
            regStatus = "CLOSED";
        } else if (isFull) {
            regStatus = "FULL";
        } else {
            regStatus = "OPEN";
        }

        boolean hasCustomForm = !eventFormFieldRepository.findByEventIdOrderByFieldOrderAsc(event.getId()).isEmpty();

        return EventResponse.builder()
                .id(event.getId())
                .organizer(userService.mapToSummaryDto(event.getOrganizer()))
                .title(event.getTitle())
                .description(event.getDescription())
                .category(event.getCategory())
                .eventDate(event.getEventDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .venue(event.getVenue())
                .eligibility(event.getEligibility())
                .maxParticipants(event.getMaxParticipants())
                .registeredCount(currentRegistrations)
                .availableSeats(Math.max(0, event.getMaxParticipants() - (int) currentRegistrations))
                .registrationDeadline(event.getRegistrationDeadline())
                .imageUrl(event.getImageUrl())
                .status(event.getStatus())
                .rejectionReason(event.getRejectionReason())
                .isRegistrationOpen(isRegistrationOpen)
                .isUserRegistered(isRegistered)
                .userRegistrationId(userRegistrationId)
                .registrationStatus(regStatus)
                .isDeadlinePassed(isDeadlinePassed)
                .isStarted(isStarted)
                .isFull(isFull)
                .hasCustomForm(hasCustomForm)
                .createdAt(event.getCreatedAt())
                .build();
    }

    public EventRegistrationResponse mapToRegistrationResponse(EventRegistration reg) {
        List<EventFormResponse> responses = eventFormResponseRepository.findByRegistration(reg);
        List<EventFormResponseDto> responseDtos = responses.stream().map(r -> EventFormResponseDto.builder()
                .fieldId(r.getFormField().getId())
                .fieldLabel(r.getFormField().getFieldLabel())
                .fieldType(r.getFormField().getFieldType())
                .responseValue(r.getResponseValue())
                .build()).collect(Collectors.toList());

        return EventRegistrationResponse.builder()
                .id(reg.getId())
                .eventId(reg.getEvent().getId())
                .eventTitle(reg.getEvent().getTitle())
                .eventCategory(reg.getEvent().getCategory())
                .eventDate(reg.getEvent().getEventDate() != null ? reg.getEvent().getEventDate().toString() : "")
                .eventTime(reg.getEvent().getStartTime() != null ? reg.getEvent().getStartTime().toString() : "")
                .eventVenue(reg.getEvent().getVenue())
                .participant(userService.mapToSummaryDto(reg.getUser()))
                .status(reg.getStatus())
                .registeredAt(reg.getRegisteredAt())
                .cancelledAt(reg.getCancelledAt())
                .formResponses(responseDtos)
                .build();
    }

    public EventFormFieldResponse mapToFormFieldResponse(EventFormField field) {
        return EventFormFieldResponse.builder()
                .id(field.getId())
                .eventId(field.getEvent().getId())
                .fieldLabel(field.getFieldLabel())
                .fieldType(field.getFieldType())
                .required(field.isRequired())
                .fieldOrder(field.getFieldOrder())
                .options(field.getOptions())
                .build();
    }
}
