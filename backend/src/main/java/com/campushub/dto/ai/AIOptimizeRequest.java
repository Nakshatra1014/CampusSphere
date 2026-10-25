package com.campushub.dto.ai;

import com.campushub.service.ai.AIService.OptimizationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIOptimizeRequest {

    @NotBlank(message = "Notes content cannot be empty")
    private String content;

    @NotNull(message = "Optimization type is required")
    private OptimizationType type;

    private String subject;
}
