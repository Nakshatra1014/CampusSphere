package com.campushub.service.ai;

public interface AIService {

    enum OptimizationType {
        SUMMARIZE,
        KEY_POINTS,
        IMPORTANT_TOPICS,
        SIMPLIFY,
        EXAM_PREP
    }

    String optimizeNotes(String content, OptimizationType type, String subject);
}
