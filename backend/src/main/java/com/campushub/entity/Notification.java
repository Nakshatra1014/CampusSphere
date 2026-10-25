package com.campushub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    public enum NotificationType {
        EVENT_SUBMITTED,
        EVENT_APPROVED,
        EVENT_REJECTED,
        EVENT_CANCELLED,
        EVENT_REGISTERED,
        EVENT_REGISTRATION_CANCELLED,
        EVENT_REMINDER,
        INTERNSHIP_POSTED,
        INTERNSHIP_APPLIED,
        TEAM_JOIN_REQUEST,
        TEAM_REQUEST_ACCEPTED,
        TEAM_REQUEST_REJECTED,
        RIDE_BOOKED,
        RIDE_BOOKING_REQUESTED,
        RIDE_BOOKING_CONFIRMED,
        RIDE_BOOKING_REJECTED,
        RIDE_CANCELLED,
        LOST_FOUND_CLAIMED,
        LOST_FOUND_RESOLVED,
        MARKETPLACE_INQUIRY,
        COMMUNITY_COMMENT,
        SYSTEM_ALERT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private NotificationType type;

    @Column(length = 50)
    private String targetEntityType;

    private Long targetEntityId;

    @Builder.Default
    @Column(nullable = false)
    private boolean isRead = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
