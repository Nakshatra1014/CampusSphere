package com.campushub.service;

import com.campushub.dto.ride.RideBookingRequest;
import com.campushub.dto.ride.RideBookingResponse;
import com.campushub.dto.ride.RideRequest;
import com.campushub.dto.ride.RideResponse;
import com.campushub.entity.Notification.NotificationType;
import com.campushub.entity.Ride;
import com.campushub.entity.Ride.RideStatus;
import com.campushub.entity.RideBooking;
import com.campushub.entity.RideBooking.BookingStatus;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ConflictException;
import com.campushub.exception.ForbiddenException;
import com.campushub.exception.ResourceNotFoundException;
import com.campushub.repository.RideBookingRepository;
import com.campushub.repository.RideRepository;
import com.campushub.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final RideBookingRepository bookingRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final SecurityUtils securityUtils;

    @Transactional
    public RideResponse createRide(RideRequest request) {
        User creator = securityUtils.getCurrentUser();

        Ride ride = Ride.builder()
                .creator(creator)
                .startLocation(request.getStartLocation().trim())
                .destination(request.getDestination().trim())
                .rideDate(request.getRideDate())
                .rideTime(request.getRideTime())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .vehicleInfo(request.getVehicleInfo())
                .notes(request.getNotes())
                .status(RideStatus.ACTIVE)
                .build();

        Ride saved = rideRepository.save(ride);
        auditLogService.logAction(creator, "RIDE_CREATED", "RIDE", saved.getId(), "Created ride: " + saved.getStartLocation() + " -> " + saved.getDestination());
        return mapToResponse(saved, creator);
    }

    @Transactional(readOnly = true)
    public List<RideResponse> searchRides(String startLocation, String destination, LocalDate date) {
        User currentUser = getCurrentUserOrNull();
        List<Ride> rides = rideRepository.searchRides(RideStatus.ACTIVE, startLocation, destination, date);
        return rides.stream().map(r -> mapToResponse(r, currentUser)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RideResponse getRideById(Long id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + id));
        return mapToResponse(ride, getCurrentUserOrNull());
    }

    @Transactional
    public RideResponse updateRide(Long id, RideRequest request) {
        User user = securityUtils.getCurrentUser();
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + id));

        if (!ride.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only edit rides you created.");
        }

        ride.setStartLocation(request.getStartLocation().trim());
        ride.setDestination(request.getDestination().trim());
        ride.setRideDate(request.getRideDate());
        ride.setRideTime(request.getRideTime());
        ride.setVehicleInfo(request.getVehicleInfo());
        ride.setNotes(request.getNotes());

        int seatDiff = request.getTotalSeats() - ride.getTotalSeats();
        ride.setTotalSeats(request.getTotalSeats());
        ride.setAvailableSeats(Math.max(0, ride.getAvailableSeats() + seatDiff));

        if (ride.getAvailableSeats() > 0 && ride.getStatus() == RideStatus.FULL) {
            ride.setStatus(RideStatus.ACTIVE);
        }

        Ride saved = rideRepository.save(ride);
        return mapToResponse(saved, user);
    }

    @Transactional
    public void deleteRide(Long id) {
        User user = securityUtils.getCurrentUser();
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + id));

        if (!ride.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only delete rides you created.");
        }

        rideRepository.delete(ride);
    }

    /**
     * Concurrency-safe seat booking using DB pessimistic write locking
     */
    @Transactional
    public RideBookingResponse bookRide(Long rideId, RideBookingRequest request) {
        User passenger = securityUtils.getCurrentUser();

        // 1. Acquire DB lock on ride row to serialize concurrent booking attempts
        Ride ride = rideRepository.findByIdWithLock(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));

        if (ride.getCreator().getId().equals(passenger.getId())) {
            throw new BadRequestException("You cannot book your own ride.");
        }

        if (ride.getStatus() != RideStatus.ACTIVE) {
            throw new BadRequestException("This ride is no longer available.");
        }

        if (ride.getRideDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book a ride for a past date.");
        }

        int requestedSeats = (request != null && request.getSeats() != null) ? request.getSeats() : 1;
        if (requestedSeats <= 0) {
            throw new BadRequestException("Requested seats must be greater than 0.");
        }

        if (ride.getAvailableSeats() < requestedSeats) {
            throw new BadRequestException("Not enough available seats. Remaining seats: " + ride.getAvailableSeats());
        }

        Optional<RideBooking> existingBooking = bookingRepository.findByRideAndPassenger(ride, passenger);
        RideBooking booking;

        if (existingBooking.isPresent()) {
            booking = existingBooking.get();
            if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.PENDING) {
                throw new ConflictException("You already have an active or pending booking on this ride.");
            } else {
                booking.setStatus(BookingStatus.PENDING);
                booking.setSeatsBooked(requestedSeats);
                booking.setCancelledAt(null);
                booking.setBookedAt(LocalDateTime.now());
            }
        } else {
            booking = RideBooking.builder()
                    .ride(ride)
                    .passenger(passenger)
                    .seatsBooked(requestedSeats)
                    .status(BookingStatus.PENDING)
                    .bookedAt(LocalDateTime.now())
                    .build();
        }

        // Deduct available seats atomically (provisionally reserved while pending)
        ride.setAvailableSeats(ride.getAvailableSeats() - requestedSeats);
        if (ride.getAvailableSeats() <= 0) {
            ride.setStatus(RideStatus.FULL);
        }
        rideRepository.save(ride);

        RideBooking saved = bookingRepository.save(booking);

        auditLogService.logAction(passenger, "RIDE_BOOKED", "RIDE", ride.getId(), "Requested " + requestedSeats + " seats on ride to " + ride.getDestination());

        // Notify Driver
        String seatCountText = requestedSeats == 1 ? "1 seat" : requestedSeats + " seats";
        String dateStr = (ride.getRideDate() != null)
                ? " on " + ride.getRideDate().format(DateTimeFormatter.ofPattern("d MMMM yyyy"))
                : "";
        String bookingMessage = passenger.getFullName() + " requested " + seatCountText + " on your ride from "
                + ride.getStartLocation() + " to " + ride.getDestination() + dateStr + ". Please confirm or decline the request.";

        notificationService.createNotification(
                ride.getCreator(),
                "New Ride Booking Request",
                bookingMessage,
                NotificationType.RIDE_BOOKING_REQUESTED,
                "RIDE",
                ride.getId()
        );

        // Notify Passenger of submission
        notificationService.createNotification(
                passenger,
                "Booking Request Submitted",
                "Your request for " + seatCountText + " on the ride from " + ride.getStartLocation()
                        + " to " + ride.getDestination() + dateStr + " has been sent to the driver for confirmation.",
                NotificationType.RIDE_BOOKED,
                "RIDE",
                ride.getId()
        );

        return mapToBookingResponse(saved);
    }

    @Transactional
    public RideBookingResponse confirmBooking(Long rideId, Long bookingId) {
        User user = securityUtils.getCurrentUser();
        Ride ride = rideRepository.findByIdWithLock(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));

        if (!ride.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the ride creator or admin can confirm bookings.");
        }

        RideBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!booking.getRide().getId().equals(rideId)) {
            throw new BadRequestException("Booking does not belong to this ride.");
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return mapToBookingResponse(booking);
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot confirm a cancelled booking.");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            if (ride.getAvailableSeats() < booking.getSeatsBooked()) {
                throw new BadRequestException("Not enough available seats to re-confirm this booking.");
            }
            ride.setAvailableSeats(ride.getAvailableSeats() - booking.getSeatsBooked());
            if (ride.getAvailableSeats() <= 0) {
                ride.setStatus(RideStatus.FULL);
            }
            rideRepository.save(ride);
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        RideBooking updated = bookingRepository.save(booking);

        auditLogService.logAction(user, "RIDE_BOOKING_CONFIRMED", "RIDE", ride.getId(), "Confirmed booking for " + booking.getPassenger().getFullName());

        // Notify Passenger
        String dateStr = (ride.getRideDate() != null) ? " on " + ride.getRideDate().format(DateTimeFormatter.ofPattern("d MMMM yyyy")) : "";
        notificationService.createNotification(
                booking.getPassenger(),
                "Ride Booking Confirmed!",
                "Great news! Your booking for " + booking.getSeatsBooked() + " seat(s) on the ride from "
                        + ride.getStartLocation() + " to " + ride.getDestination() + dateStr + " has been confirmed by " + ride.getCreator().getFullName() + ".",
                NotificationType.RIDE_BOOKING_CONFIRMED,
                "RIDE",
                ride.getId()
        );

        return mapToBookingResponse(updated);
    }

    @Transactional
    public RideBookingResponse rejectBooking(Long rideId, Long bookingId) {
        User user = securityUtils.getCurrentUser();
        Ride ride = rideRepository.findByIdWithLock(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));

        if (!ride.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the ride creator or admin can decline bookings.");
        }

        RideBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!booking.getRide().getId().equals(rideId)) {
            throw new BadRequestException("Booking does not belong to this ride.");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            return mapToBookingResponse(booking);
        }

        // Return seats if it was PENDING or CONFIRMED
        if (booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.CONFIRMED) {
            ride.setAvailableSeats(Math.min(ride.getTotalSeats(), ride.getAvailableSeats() + booking.getSeatsBooked()));
            if (ride.getStatus() == RideStatus.FULL && ride.getAvailableSeats() > 0) {
                ride.setStatus(RideStatus.ACTIVE);
            }
            rideRepository.save(ride);
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setCancelledAt(LocalDateTime.now());
        RideBooking updated = bookingRepository.save(booking);

        auditLogService.logAction(user, "RIDE_BOOKING_REJECTED", "RIDE", ride.getId(), "Declined booking for " + booking.getPassenger().getFullName());

        // Notify Passenger
        String dateStr = (ride.getRideDate() != null) ? " on " + ride.getRideDate().format(DateTimeFormatter.ofPattern("d MMMM yyyy")) : "";
        notificationService.createNotification(
                booking.getPassenger(),
                "Ride Booking Declined",
                "Your booking request for the ride from " + ride.getStartLocation() + " to " + ride.getDestination() + dateStr + " was declined by the driver.",
                NotificationType.RIDE_BOOKING_REJECTED,
                "RIDE",
                ride.getId()
        );

        return mapToBookingResponse(updated);
    }

    @Transactional
    public RideBookingResponse cancelBooking(Long rideId) {
        User passenger = securityUtils.getCurrentUser();
        Ride ride = rideRepository.findByIdWithLock(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));

        Optional<RideBooking> bookingOpt = bookingRepository.findByRideAndPassengerAndStatus(ride, passenger, BookingStatus.CONFIRMED);
        if (bookingOpt.isEmpty()) {
            bookingOpt = bookingRepository.findByRideAndPassengerAndStatus(ride, passenger, BookingStatus.PENDING);
        }

        RideBooking booking = bookingOpt.orElseThrow(() -> new ResourceNotFoundException("Active or pending booking not found for this ride."));

        return executeCancelBooking(ride, booking, passenger);
    }

    @Transactional
    public RideBookingResponse cancelBookingById(Long rideId, Long bookingId) {
        User user = securityUtils.getCurrentUser();
        Ride ride = rideRepository.findByIdWithLock(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));

        RideBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!booking.getPassenger().getId().equals(user.getId()) && !ride.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("You can only cancel your own booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled.");
        }

        return executeCancelBooking(ride, booking, user);
    }

    private RideBookingResponse executeCancelBooking(Ride ride, RideBooking booking, User actor) {
        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        RideBooking updatedBooking = bookingRepository.save(booking);

        // Return seats back to ride only if it was holding seats
        if (oldStatus == BookingStatus.CONFIRMED || oldStatus == BookingStatus.PENDING) {
            ride.setAvailableSeats(Math.min(ride.getTotalSeats(), ride.getAvailableSeats() + booking.getSeatsBooked()));
            if (ride.getStatus() == RideStatus.FULL && ride.getAvailableSeats() > 0) {
                ride.setStatus(RideStatus.ACTIVE);
            }
            rideRepository.save(ride);
        }

        String dateStr = (ride.getRideDate() != null) ? " on " + ride.getRideDate().format(DateTimeFormatter.ofPattern("d MMMM yyyy")) : "";

        // Notify the OTHER affected party
        if (actor.getId().equals(booking.getPassenger().getId())) {
            // Passenger cancelled -> Notify Driver
            notificationService.createNotification(
                    ride.getCreator(),
                    "Ride Booking Cancelled",
                    booking.getPassenger().getFullName() + " cancelled their seat reservation on your ride from "
                            + ride.getStartLocation() + " to " + ride.getDestination() + dateStr + ".",
                    NotificationType.RIDE_CANCELLED,
                    "RIDE",
                    ride.getId()
            );
        } else {
            // Driver or Admin cancelled -> Notify Passenger
            notificationService.createNotification(
                    booking.getPassenger(),
                    "Ride Booking Cancelled by Driver",
                    "Your seat booking for the ride from " + ride.getStartLocation() + " to " + ride.getDestination() + dateStr + " was cancelled by the driver.",
                    NotificationType.RIDE_CANCELLED,
                    "RIDE",
                    ride.getId()
            );
        }

        return mapToBookingResponse(updatedBooking);
    }

    @Transactional
    public RideResponse cancelRide(Long rideId) {
        User user = securityUtils.getCurrentUser();
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));

        if (!ride.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenException("Only the ride creator or admin can cancel this ride.");
        }

        ride.setStatus(RideStatus.CANCELLED);
        Ride saved = rideRepository.save(ride);

        // Notify all booked passengers (CONFIRMED or PENDING)
        List<RideBooking> bookings = bookingRepository.findByRideOrderByBookedAtAsc(ride);
        for (RideBooking b : bookings) {
            if (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING) {
                b.setStatus(BookingStatus.CANCELLED);
                b.setCancelledAt(LocalDateTime.now());
                bookingRepository.save(b);

                notificationService.createNotification(
                        b.getPassenger(),
                        "Ride Cancelled by Driver",
                        "The ride to " + ride.getDestination() + " on " + ride.getRideDate() + " was cancelled by the driver.",
                        NotificationType.RIDE_CANCELLED,
                        "RIDE",
                        ride.getId()
                );
            }
        }

        return mapToResponse(saved, user);
    }

    @Transactional(readOnly = true)
    public List<RideResponse> getMyCreatedRides() {
        User user = securityUtils.getCurrentUser();
        return rideRepository.findByCreatorOrderByCreatedAtDesc(user).stream()
                .map(r -> mapToResponse(r, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RideBookingResponse> getMyBookedRides() {
        User user = securityUtils.getCurrentUser();
        return bookingRepository.findByPassengerOrderByBookedAtDesc(user).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUserOrNull() {
        try {
            return securityUtils.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public RideResponse mapToResponse(Ride ride, User currentUser) {
        boolean isBooked = false;
        Long bookingId = null;
        List<RideBookingResponse> passengers = null;

        if (currentUser != null) {
            Optional<RideBooking> booking = bookingRepository.findByRideAndPassenger(ride, currentUser);
            if (booking.isPresent() && (booking.get().getStatus() == BookingStatus.CONFIRMED || booking.get().getStatus() == BookingStatus.PENDING)) {
                isBooked = true;
                bookingId = booking.get().getId();
            }

            // Creator or Admin can view passenger list
            if (ride.getCreator().getId().equals(currentUser.getId()) || currentUser.getRole() == Role.ROLE_ADMIN) {
                passengers = bookingRepository.findByRideOrderByBookedAtAsc(ride).stream()
                        .map(this::mapToBookingResponse)
                        .collect(Collectors.toList());
            }
        }

        return RideResponse.builder()
                .id(ride.getId())
                .creator(userService.mapToSummaryDto(ride.getCreator()))
                .startLocation(ride.getStartLocation())
                .destination(ride.getDestination())
                .rideDate(ride.getRideDate())
                .rideTime(ride.getRideTime())
                .totalSeats(ride.getTotalSeats())
                .availableSeats(ride.getAvailableSeats())
                .vehicleInfo(ride.getVehicleInfo())
                .notes(ride.getNotes())
                .status(ride.getStatus())
                .isUserBooked(isBooked)
                .userBookingId(bookingId)
                .passengers(passengers)
                .createdAt(ride.getCreatedAt())
                .build();
    }

    public RideBookingResponse mapToBookingResponse(RideBooking b) {
        Ride r = b.getRide();
        return RideBookingResponse.builder()
                .id(b.getId())
                .rideId(r != null ? r.getId() : null)
                .passenger(userService.mapToSummaryDto(b.getPassenger()))
                .seatsBooked(b.getSeatsBooked())
                .status(b.getStatus())
                .bookedAt(b.getBookedAt())
                .cancelledAt(b.getCancelledAt())
                .startLocation(r != null ? r.getStartLocation() : null)
                .destination(r != null ? r.getDestination() : null)
                .rideDate(r != null ? r.getRideDate() : null)
                .rideTime(r != null ? r.getRideTime() : null)
                .driver(r != null && r.getCreator() != null ? userService.mapToSummaryDto(r.getCreator()) : null)
                .vehicleInfo(r != null ? r.getVehicleInfo() : null)
                .notes(r != null ? r.getNotes() : null)
                .rideStatus(r != null ? r.getStatus() : null)
                .availableSeats(r != null ? r.getAvailableSeats() : null)
                .totalSeats(r != null ? r.getTotalSeats() : null)
                .build();
    }
}
