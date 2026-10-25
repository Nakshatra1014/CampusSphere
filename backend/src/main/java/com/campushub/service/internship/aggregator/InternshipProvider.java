package com.campushub.service.internship.aggregator;

import java.util.List;

/**
 * Common interface for external internship aggregation providers.
 * Allows clean extensibility for future sources (e.g. Internshala, Unstop, etc.).
 */
public interface InternshipProvider {

    /**
     * Unique identifier for this provider (e.g., "INTERNSHALA").
     */
    String getProviderName();

    /**
     * Display label for UI and reporting (e.g., "Internshala").
     */
    String getDisplayName();

    /**
     * Fetches internship listings from the external source according to options.
     */
    List<InternshipListingDto> fetchInternships(InternshipSyncOptions options);
}
