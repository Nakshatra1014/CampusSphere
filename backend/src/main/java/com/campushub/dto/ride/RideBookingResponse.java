package com.campushub.dto.ride;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.Ride.RideStatus;
import com.campushub.entity.RideBooking.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideBookingResponse {
    private Long id;
    private Long rideId;
    private UserSummaryDto passenger;
    private Integer seatsBooked;
    private BookingStatus status;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;

    // Ride details
    private String startLocation;
    private String destination;
    private LocalDate rideDate;
    private LocalTime rideTime;
    private UserSummaryDto driver;
    private String vehicleInfo;
    private String notes;
    private RideStatus rideStatus;
    private Integer availableSeats;
    private Integer totalSeats;
}
