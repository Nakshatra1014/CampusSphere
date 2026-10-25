package com.campushub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "event_form_fields",
    indexes = {
        @Index(name = "idx_form_fields_event", columnList = "event_id"),
        @Index(name = "idx_form_fields_order", columnList = "field_order")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventFormField {

    public enum FieldType {
        TEXT,
        NUMBER,
        EMAIL,
        PHONE,
        DROPDOWN,
        RADIO,
        CHECKBOX,
        TEXTAREA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "field_label", nullable = false, length = 255)
    private String fieldLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "field_type", nullable = false, length = 50)
    private FieldType fieldType;

    @Column(nullable = false)
    @Builder.Default
    private boolean required = false;

    @Column(name = "field_order", nullable = false)
    @Builder.Default
    private Integer fieldOrder = 0;

    @Column(name = "options", columnDefinition = "TEXT")
    private String options;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
