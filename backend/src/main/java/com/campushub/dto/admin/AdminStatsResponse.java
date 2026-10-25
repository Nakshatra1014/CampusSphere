package com.campushub.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponse {
    private long totalStudents;
    private long totalFaculty;
    private long totalEvents;
    private long pendingEvents;
    private long approvedEvents;
    private long totalInternships;
    private long totalResources;
    private long totalRides;
    private long totalTeams;
    private long totalMarketplaceItems;
    private long pendingLostFound;
}
