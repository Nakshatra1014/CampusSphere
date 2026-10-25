package com.campushub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "internship_applications",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"internship_id", "applicant_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipApplication {

    public enum ApplicationStatus {
        APPLIED,
        UNDER_REVIEW,
        SELECTED,
        ACCEPTED,
        REJECTED,
        WITHDRAWN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internship_id", nullable = false)
    private Internship internship;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Column(length = 500)
    private String resumeUrl;

    @Column(columnDefinition = "TEXT")
    private String coverNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "is_self_reported", nullable = false)
    @Builder.Default
    private boolean isSelfReported = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime appliedAt;
}
