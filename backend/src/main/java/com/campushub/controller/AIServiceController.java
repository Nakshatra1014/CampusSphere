package com.campushub.controller;

import com.campushub.dto.ApiResponse;
import com.campushub.dto.ai.AIOptimizeRequest;
import com.campushub.dto.ai.AIOptimizeResponse;
import com.campushub.service.ai.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIServiceController {

    private final AIService aiService;

    @PostMapping("/optimize-notes")
    public ResponseEntity<ApiResponse<AIOptimizeResponse>> optimizeNotes(@Valid @RequestBody AIOptimizeRequest request) {
        String result = aiService.optimizeNotes(request.getContent(), request.getType(), request.getSubject());

        AIOptimizeResponse response = AIOptimizeResponse.builder()
                .optimizedContent(result)
                .optimizationType(request.getType().name())
                .subject(request.getSubject())
                .provider("CampusHub Intelligent Academic Engine")
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Notes successfully optimized."));
    }
}
