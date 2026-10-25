package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.event.*;
import com.campushub.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEventRequest(@Valid @RequestBody EventRequest request) {
        EventResponse response = eventService.createEventRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Event request submitted successfully. It will be visible once approved by administration."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getApprovedEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate
    ) {
        List<EventResponse> events = eventService.getApprovedEvents(category, search, fromDate);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(@PathVariable Long id) {
        EventResponse event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request
    ) {
        EventResponse updated = eventService.updateEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Event updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Event deleted successfully."));
    }

    @GetMapping({"/my", "/my-organized"})
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyOrganizedEvents() {
        List<EventResponse> events = eventService.getMyOrganizedEvents();
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<ApiResponse<List<EventRegistrationResponse>>> getMyRegistrations() {
        List<EventRegistrationResponse> registrations = eventService.getMyRegistrations();
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> registerForEvent(
            @PathVariable Long id,
            @RequestBody(required = false) EventRegistrationRequest request
    ) {
        EventRegistrationResponse response = eventService.registerForEvent(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Successfully registered for the event."));
    }

    @PostMapping("/{id}/cancel-registration")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> cancelRegistrationPost(@PathVariable Long id) {
        EventRegistrationResponse response = eventService.cancelRegistration(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Registration cancelled successfully."));
    }

    @PutMapping("/{id}/cancel-registration")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> cancelRegistrationPut(@PathVariable Long id) {
        EventRegistrationResponse response = eventService.cancelRegistration(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Registration cancelled successfully."));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<ApiResponse<List<EventRegistrationResponse>>> getEventParticipants(@PathVariable Long id) {
        List<EventRegistrationResponse> participants = eventService.getEventParticipants(id);
        return ResponseEntity.ok(ApiResponse.success(participants));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<EventResponse>> cancelEvent(@PathVariable Long id) {
        EventResponse event = eventService.cancelEvent(id);
        return ResponseEntity.ok(ApiResponse.success(event, "Event cancelled successfully."));
    }

    // -------------------------------------------------------------
    // Form Builder Endpoints
    // -------------------------------------------------------------

    @GetMapping("/{id}/form-fields")
    public ResponseEntity<ApiResponse<List<EventFormFieldResponse>>> getEventFormFields(@PathVariable Long id) {
        List<EventFormFieldResponse> fields = eventService.getEventFormFields(id);
        return ResponseEntity.ok(ApiResponse.success(fields));
    }

    @PostMapping("/{id}/form-fields")
    public ResponseEntity<ApiResponse<EventFormFieldResponse>> addFormField(
            @PathVariable Long id,
            @Valid @RequestBody EventFormFieldRequest request
    ) {
        EventFormFieldResponse created = eventService.addFormField(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Form field added successfully."));
    }

    @PutMapping("/{id}/form-fields/{fieldId}")
    public ResponseEntity<ApiResponse<EventFormFieldResponse>> updateFormField(
            @PathVariable Long id,
            @PathVariable Long fieldId,
            @Valid @RequestBody EventFormFieldRequest request
    ) {
        EventFormFieldResponse updated = eventService.updateFormField(id, fieldId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Form field updated successfully."));
    }

    @DeleteMapping("/{id}/form-fields/{fieldId}")
    public ResponseEntity<ApiResponse<Void>> deleteFormField(
            @PathVariable Long id,
            @PathVariable Long fieldId
    ) {
        eventService.deleteFormField(id, fieldId);
        return ResponseEntity.ok(ApiResponse.success(null, "Form field deleted successfully."));
    }
}
