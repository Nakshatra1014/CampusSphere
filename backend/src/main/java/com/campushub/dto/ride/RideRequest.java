package com.campushub.dto.ride;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideRequest {

    @NotBlank(message = "Starting location is required")
    private String startLocation;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Ride date is required")
    private LocalDate rideDate;

    @NotNull(message = "Ride time is required")
    private LocalTime rideTime;

    @NotNull(message = "Total seats is required")
    @Min(value = 1, message = "Must offer at least 1 seat")
    private Integer totalSeats;

    private String vehicleInfo;
    private String notes;
}
