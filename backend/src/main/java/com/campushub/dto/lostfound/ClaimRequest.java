package com.campushub.dto.lostfound;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimRequest {
    @NotBlank(message = "Claim description or proof is required")
    private String claimNote;
}
