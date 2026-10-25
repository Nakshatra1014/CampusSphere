package com.campushub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "internships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Internship {

    public enum WorkMode {
        REMOTE,
        ON_SITE,
        HYBRID
    }

    public enum InternshipStatus {
        ACTIVE,
        CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by_id", nullable = true)
    private User postedBy;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkMode workMode;

    @Column(length = 50)
    private String stipend;

    @Column(length = 50)
    private String duration;

    @Column(length = 150)
    private String eligibility;

    @Column(columnDefinition = "TEXT")
    private String skillsRequired;

    @Column(nullable = true)
    private LocalDate applicationDeadline;

    @Column(length = 500)
    private String applicationLink;

    @Column(name = "source_platform", length = 50)
    @Builder.Default
    private String sourcePlatform = "CAMPUSSPHERE";

    @Column(name = "is_external", nullable = false)
    @Builder.Default
    private boolean isExternal = false;

    @Column(name = "external_id", length = 255)
    private String externalId;

    @Column(name = "external_url", length = 1000)
    private String externalUrl;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InternshipStatus status = InternshipStatus.ACTIVE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
