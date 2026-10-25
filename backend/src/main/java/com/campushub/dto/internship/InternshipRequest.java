package com.campushub.dto.internship;

import com.campushub.entity.Internship.WorkMode;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipRequest {

    @NotBlank(message = "Internship title is required")
    private String title;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Work mode is required")
    private WorkMode workMode;

    private String stipend;
    private String duration;
    private String eligibility;
    private String skillsRequired;

    @NotNull(message = "Application deadline is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate applicationDeadline;

    private String applicationLink;
}
