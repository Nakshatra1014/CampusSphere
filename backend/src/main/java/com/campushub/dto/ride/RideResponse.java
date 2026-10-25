package com.campushub.dto.ride;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.Ride.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideResponse {
    private Long id;
    private UserSummaryDto creator;
    private String startLocation;
    private String destination;
    private LocalDate rideDate;
    private LocalTime rideTime;
    private Integer totalSeats;
    private Integer availableSeats;
    private String vehicleInfo;
    private String notes;
    private RideStatus status;
    private boolean isUserBooked;
    private Long userBookingId;
    private List<RideBookingResponse> passengers;
    private LocalDateTime createdAt;
}
