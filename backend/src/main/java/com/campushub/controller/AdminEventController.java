package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.event.EventResponse;
import com.campushub.dto.event.RejectEventRequest;
import com.campushub.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminEventController {

    private final EventService eventService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getPendingEvents() {
        List<EventResponse> events = eventService.getPendingEvents();
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<EventResponse>> approveEvent(@PathVariable Long id) {
        EventResponse event = eventService.approveEvent(id);
        return ResponseEntity.ok(ApiResponse.success(event, "Event approved and published to the campus successfully."));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<EventResponse>> rejectEvent(
            @PathVariable Long id,
            @Valid @RequestBody RejectEventRequest request
    ) {
        EventResponse event = eventService.rejectEvent(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(event, "Event request rejected."));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<EventResponse>> cancelEvent(@PathVariable Long id) {
        EventResponse event = eventService.cancelEvent(id);
        return ResponseEntity.ok(ApiResponse.success(event, "Event cancelled by administrator."));
    }
}
