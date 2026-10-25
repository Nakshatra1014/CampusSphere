package com.campushub.service.internship.aggregator;

import com.campushub.entity.Internship.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Normalized model for internship listings aggregated from any external provider (e.g. Internshala, Unstop).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipListingDto {
    private String externalId;
    private String title;
    private String companyName;
    private String companyUrl;
    private String description;
    private String location;
    private WorkMode workMode;
    private String stipend;
    private String duration;
    private String eligibility;
    private String skillsRequired;
    private LocalDate applicationDeadline;
    private String externalUrl;
    private String sourcePlatform;
}
