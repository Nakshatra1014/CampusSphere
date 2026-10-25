package com.campushub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "event_form_responses",
    indexes = {
        @Index(name = "idx_form_responses_reg", columnList = "registration_id"),
        @Index(name = "idx_form_responses_field", columnList = "field_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventFormResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private EventRegistration registration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private EventFormField formField;

    @Column(name = "response_value", columnDefinition = "TEXT")
    private String responseValue;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
