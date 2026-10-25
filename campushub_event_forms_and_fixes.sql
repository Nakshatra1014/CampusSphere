-- 1. Create table for dynamic event custom registration form fields
CREATE TABLE IF NOT EXISTS event_form_fields (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    field_order INT NOT NULL DEFAULT 0,
    options TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_form_fields_event
        FOREIGN KEY (event_id) REFERENCES events (id)
        ON DELETE CASCADE,
    INDEX idx_event_form_fields_event_order (event_id, field_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create table for participant custom form responses
CREATE TABLE IF NOT EXISTS event_form_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT NOT NULL,
    field_id BIGINT NOT NULL,
    response_value TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_form_responses_registration
        FOREIGN KEY (registration_id) REFERENCES event_registrations (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_event_form_responses_field
        FOREIGN KEY (field_id) REFERENCES event_form_fields (id)
        ON DELETE CASCADE,
    INDEX idx_event_form_responses_reg (registration_id),
    INDEX idx_event_form_responses_field (field_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Unique constraint on (event_id, user_id) in event_registrations
ALTER TABLE event_registrations ADD CONSTRAINT uk_event_registrations_event_user UNIQUE (event_id, user_id);

-- 4. Unique constraint on (internship_id, applicant_id) in internship_applications
ALTER TABLE internship_applications ADD CONSTRAINT uk_internship_applications_internship_applicant UNIQUE (internship_id, applicant_id);

-- 5. Performance indexes
CREATE INDEX idx_events_status_deadline ON events (status, registration_deadline);
CREATE INDEX idx_internships_status_deadline ON internships (status, application_deadline);
