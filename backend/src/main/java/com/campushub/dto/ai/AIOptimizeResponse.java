package com.campushub.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIOptimizeResponse {
    private String optimizedContent;
    private String optimizationType;
    private String subject;
    private String provider;
}
