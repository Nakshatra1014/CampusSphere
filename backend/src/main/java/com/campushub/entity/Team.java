package com.campushub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    public enum TeamStatus {
        RECRUITING,
        FULL,
        COMPLETED,
        CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    @Column(nullable = false, length = 150)
    private String teamName;

    @Column(nullable = false, length = 150)
    private String projectName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(nullable = false)
    private Integer membersRequired;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentMembersCount = 1;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(nullable = false, length = 50)
    private String category; // e.g., Hackathon, Academic Project, Research, Competition

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TeamStatus status = TeamStatus.RECRUITING;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
