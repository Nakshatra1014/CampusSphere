package com.campushub.service.internship.aggregator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipSyncOptions {
    @Builder.Default
    private int limit = 15;

    @Builder.Default
    private String keywords = "computer science,software engineering";

    private String location;
    private Boolean remoteOnly;
}
