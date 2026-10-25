package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.ride.RideBookingRequest;
import com.campushub.dto.ride.RideBookingResponse;
import com.campushub.dto.ride.RideRequest;
import com.campushub.dto.ride.RideResponse;
import com.campushub.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping
    public ResponseEntity<ApiResponse<RideResponse>> createRide(@Valid @RequestBody RideRequest request) {
        RideResponse response = rideService.createRide(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Ride created successfully."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RideResponse>>> searchRides(
            @RequestParam(value = "startLocation", required = false) String startLocation,
            @RequestParam(value = "destination", required = false) String destination,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<RideResponse> rides = rideService.searchRides(startLocation, destination, date);
        return ResponseEntity.ok(ApiResponse.success(rides));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RideResponse>> getRideById(@PathVariable("id") Long id) {
        RideResponse ride = rideService.getRideById(id);
        return ResponseEntity.ok(ApiResponse.success(ride));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RideResponse>> updateRide(
            @PathVariable("id") Long id,
            @Valid @RequestBody RideRequest request
    ) {
        RideResponse updated = rideService.updateRide(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Ride updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRide(@PathVariable("id") Long id) {
        rideService.deleteRide(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Ride deleted successfully."));
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<ApiResponse<RideBookingResponse>> bookRide(
            @PathVariable("id") Long id,
            @RequestBody(required = false) RideBookingRequest request
    ) {
        RideBookingResponse response = rideService.bookRide(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Seat(s) booked successfully."));
    }

    @PutMapping("/{id}/cancel-booking")
    public ResponseEntity<ApiResponse<RideBookingResponse>> cancelBooking(@PathVariable("id") Long id) {
        RideBookingResponse response = rideService.cancelBooking(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking cancelled successfully."));
    }

    @PutMapping("/{id}/bookings/{bookingId}/confirm")
    public ResponseEntity<ApiResponse<RideBookingResponse>> confirmBooking(
            @PathVariable("id") Long id,
            @PathVariable("bookingId") Long bookingId
    ) {
        RideBookingResponse response = rideService.confirmBooking(id, bookingId);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking confirmed successfully."));
    }

    @PutMapping("/{id}/bookings/{bookingId}/reject")
    public ResponseEntity<ApiResponse<RideBookingResponse>> rejectBooking(
            @PathVariable("id") Long id,
            @PathVariable("bookingId") Long bookingId
    ) {
        RideBookingResponse response = rideService.rejectBooking(id, bookingId);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking declined."));
    }

    @PutMapping("/{id}/bookings/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<RideBookingResponse>> cancelBookingById(
            @PathVariable("id") Long id,
            @PathVariable("bookingId") Long bookingId
    ) {
        RideBookingResponse response = rideService.cancelBookingById(id, bookingId);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking cancelled successfully."));
    }

    @PutMapping("/{id}/cancel-ride")
    public ResponseEntity<ApiResponse<RideResponse>> cancelRide(@PathVariable("id") Long id) {
        RideResponse response = rideService.cancelRide(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Ride cancelled successfully."));
    }

    @GetMapping({"/my", "/my-created", "/my-rides"})
    public ResponseEntity<ApiResponse<List<RideResponse>>> getMyCreatedRides() {
        List<RideResponse> list = rideService.getMyCreatedRides();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<RideBookingResponse>>> getMyBookedRides() {
        List<RideBookingResponse> list = rideService.getMyBookedRides();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
