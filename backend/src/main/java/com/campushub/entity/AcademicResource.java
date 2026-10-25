package com.campushub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "academic_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false, length = 50)
    private String resourceType; // e.g. Lecture Notes, Syllabus, Question Paper, Reference Material, Lab Manual

    @Column(length = 255)
    private String tags;

    @Column(nullable = false, length = 500)
    private String fileUrl;

    @Column(length = 255)
    private String fileName;

    private Long fileSize;

    @Column(length = 255)
    private String publicId;

    @Builder.Default
    @Column(nullable = false)
    private Integer downloadCount = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
