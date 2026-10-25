package com.campushub.dto.team;

import jakarta.validation.constraints.Min;
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
public class TeamRequest {

    @NotBlank(message = "Team name is required")
    private String teamName;

    @NotBlank(message = "Project or event name is required")
    private String projectName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Required skills is required")
    private String requiredSkills;

    @NotNull(message = "Members required count is required")
    @Min(value = 1, message = "Team must need at least 1 member")
    private Integer membersRequired;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotBlank(message = "Category is required")
    private String category;
}
