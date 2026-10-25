package com.campushub.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    private String phone;
    private String department;
    private String academicYear;
    private String college;
    private String bio;
    private String skills;
    private String profileImageUrl;
}
