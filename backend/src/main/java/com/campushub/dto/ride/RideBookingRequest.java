package com.campushub.dto.ride;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideBookingRequest {
    @Builder.Default
    @Min(value = 1, message = "Must book at least 1 seat")
    private Integer seats = 1;
}
