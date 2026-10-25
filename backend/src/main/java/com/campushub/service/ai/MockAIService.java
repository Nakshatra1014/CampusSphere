package com.campushub.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MockAIService implements AIService {

    @Value("${app.ai.provider:mock}")
    private String aiProvider;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Override
    public String optimizeNotes(String content, OptimizationType type, String subject) {
        if (content == null || content.trim().isEmpty()) {
            return "Please provide content to optimize.";
        }

        String sub = (subject != null && !subject.isBlank()) ? subject : "Academic Subject";

        switch (type) {
            case SUMMARIZE:
                return generateSummary(content, sub);
            case KEY_POINTS:
                return generateKeyPoints(content, sub);
            case IMPORTANT_TOPICS:
                return generateImportantTopics(content, sub);
            case SIMPLIFY:
                return generateSimplifiedNotes(content, sub);
            case EXAM_PREP:
                return generateExamPrep(content, sub);
            default:
                return generateSummary(content, sub);
        }
    }

    private String generateSummary(String content, String subject) {
        String[] sentences = content.split("(?<=[.!?])\\s+");
        List<String> keySentences = Arrays.stream(sentences)
                .filter(s -> s.length() > 20)
                .limit(4)
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("### 📚 Executive Summary: ").append(subject).append("\n\n");
        sb.append("**Overview & Core Concept:**\n");
        sb.append(keySentences.isEmpty() ? content : String.join(" ", keySentences)).append("\n\n");
        sb.append("### 💡 High-Yield Takeaway:\n");
        sb.append("The subject material centers on foundational principles, efficient implementation patterns, and analytical problem-solving required for campus coursework and examinations.\n\n");
        sb.append("> **Quick Revision Tip:** Focus on core definitions, formulaic relationships, and the structural diagrams presented in class lectures.");
        return sb.toString();
    }

    private String generateKeyPoints(String content, String subject) {
        String[] lines = content.split("\n");
        List<String> meaningful = Arrays.stream(lines)
                .map(String::trim)
                .filter(l -> l.length() > 10)
                .limit(6)
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("### 🎯 Key Learning Points: ").append(subject).append("\n\n");
        if (meaningful.isEmpty()) {
            sb.append("- **Core Definition:** Foundational terminology and problem space characteristics.\n");
            sb.append("- **Primary Mechanism:** Execution workflow and step-by-step methodologies.\n");
            sb.append("- **Key Trade-offs:** Computational/theoretical complexity, advantages, and limitations.\n");
            sb.append("- **Practical Application:** Real-world campus projects and laboratory use-cases.\n");
        } else {
            for (int i = 0; i < meaningful.size(); i++) {
                sb.append("- **Point ").append(i + 1).append(":** ").append(meaningful.get(i)).append("\n");
            }
        }
        sb.append("\n**Recommended Follow-up:** Test your understanding by writing pseudocode or explaining these points without reference material.");
        return sb.toString();
    }

    private String generateImportantTopics(String content, String subject) {
        StringBuilder sb = new StringBuilder();
        sb.append("### 📌 Important Topics & Examination Blueprint: ").append(subject).append("\n\n");
        sb.append("1. **Theoretical Foundations & Architecture** (Weightage: High)\n");
        sb.append("   - Core definitions, component interactions, and state transitions.\n");
        sb.append("2. **Algorithmic Procedures & Step-by-Step Methods** (Weightage: High)\n");
        sb.append("   - Execution flows, edge cases, and boundary condition handling.\n");
        sb.append("3. **Comparative Analysis & Evaluation** (Weightage: Medium)\n");
        sb.append("   - Differences between traditional vs modern architectural approaches.\n");
        sb.append("4. **Potential Midterm / Endterm Viva Questions**\n");
        sb.append("   - *Q1:* Explain the primary objective of this topic in system design.\n");
        sb.append("   - *Q2:* What are the key bottlenecks and how can they be mitigated?\n");
        return sb.toString();
    }

    private String generateSimplifiedNotes(String content, String subject) {
        StringBuilder sb = new StringBuilder();
        sb.append("### 🧩 Simplified \"Explain Like I'm 5\" Breakdown: ").append(subject).append("\n\n");
        sb.append("Imagine you are organizing a massive campus festival:\n\n");
        sb.append("- **The Big Picture:** Instead of having everyone do everything at once, we break the work down into dedicated, specialized zones.\n");
        sb.append("- **Why it Matters:** This prevents confusion, speeds up delivery, and makes finding errors instantaneous.\n");
        sb.append("- **Simple Mental Model:** Input goes in $\\rightarrow$ rules are verified $\\rightarrow$ output is returned safely.\n\n");
        sb.append("**Analogy:** Think of this module like a library catalog system—it organizes thousands of resources so anyone can find what they need in seconds.");
        return sb.toString();
    }

    private String generateExamPrep(String content, String subject) {
        StringBuilder sb = new StringBuilder();
        sb.append("### 📝 Exam Preparation Crash Sheet: ").append(subject).append("\n\n");
        sb.append("#### Must-Memorize Formulas / Definitions:\n");
        sb.append("- **Definition 1:** Formal specification and primary invariants.\n");
        sb.append("- **Theorem / Rule:** Correctness constraints and edge-case exceptions.\n\n");
        sb.append("#### Quick Self-Test Quiz:\n");
        sb.append("1. What happens if the input constraints are violated?\n");
        sb.append("2. Name two real-world scenarios where this technique is preferred.\n");
        sb.append("3. What is the time/resource complexity of this approach?\n");
        return sb.toString();
    }
}
