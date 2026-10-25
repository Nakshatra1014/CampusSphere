package com.campushub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "roommate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoommateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String preferredLocation;

    @Column(nullable = false, length = 50)
    private String budgetRange; // e.g. "< $500", "$500 - $800", "$800+"

    @Column(nullable = false, length = 50)
    private String occupancyPreference; // e.g. Single, Shared (2 people), Shared (3+ people)

    @Column(length = 100)
    private String lifestyle; // e.g. Early Bird, Night Owl, Balanced

    @Column(length = 100)
    private String studyHabits; // e.g. Quiet environment, Group study, Music in background

    @Column(length = 100)
    private String foodPreference; // e.g. Vegetarian, Non-Vegetarian, Any

    @Column(length = 100)
    private String sleepSchedule; // e.g. 10 PM - 6 AM, 1 AM - 8 AM, Flexible

    @Column(columnDefinition = "TEXT")
    private String interests;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
