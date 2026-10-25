-- =========================================================
-- CAMPUSHUB DATABASE
-- Smart College Campus Management Platform
-- MySQL
-- =========================================================

CREATE DATABASE IF NOT EXISTS campushub;
USE campushub;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    academic_year VARCHAR(50),
    phone VARCHAR(20),
    profile_image_url VARCHAR(500),
    bio VARCHAR(1000),
    skills TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN'))
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

CREATE TABLE events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organizer_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    eligibility VARCHAR(500),
    max_participants INT NOT NULL,
    registration_deadline DATETIME NOT NULL,
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_organizer FOREIGN KEY (organizer_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_event_status CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED','COMPLETED')),
    CONSTRAINT chk_event_capacity CHECK (max_participants > 0),
    CONSTRAINT chk_event_time CHECK (end_time > start_time)
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_category ON events(category);

CREATE TABLE event_registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME NULL,
    CONSTRAINT fk_event_registration_event FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_event_registration_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_event_user UNIQUE (event_id, user_id),
    CONSTRAINT chk_registration_status CHECK (status IN ('REGISTERED','CANCELLED'))
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);

CREATE TABLE internships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    posted_by_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200),
    work_mode VARCHAR(50),
    stipend VARCHAR(100),
    duration VARCHAR(100),
    eligibility VARCHAR(500),
    skills_required TEXT,
    application_deadline DATE NOT NULL,
    application_link VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_internship_poster FOREIGN KEY (posted_by_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_internship_status CHECK (status IN ('ACTIVE','CLOSED','EXPIRED'))
);

CREATE INDEX idx_internships_posted_by ON internships(posted_by_id);
CREATE INDEX idx_internships_company ON internships(company_name);
CREATE INDEX idx_internships_deadline ON internships(application_deadline);

CREATE TABLE internship_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    internship_id BIGINT NOT NULL,
    applicant_id BIGINT NOT NULL,
    resume_url VARCHAR(500),
    cover_note TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_internship FOREIGN KEY (internship_id) REFERENCES internships(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_application_user FOREIGN KEY (applicant_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_internship_applicant UNIQUE (internship_id, applicant_id),
    CONSTRAINT chk_application_status CHECK (
        status IN ('APPLIED','UNDER_REVIEW','SELECTED','REJECTED','WITHDRAWN')
    )
);

CREATE INDEX idx_applications_internship ON internship_applications(internship_id);
CREATE INDEX idx_applications_applicant ON internship_applications(applicant_id);

CREATE TABLE academic_resources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uploaded_by_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    semester INT,
    resource_type VARCHAR(100),
    tags VARCHAR(500),
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    download_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resource_uploader FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_resource_semester CHECK (semester IS NULL OR semester BETWEEN 1 AND 8)
);

CREATE INDEX idx_resources_subject ON academic_resources(subject);
CREATE INDEX idx_resources_department ON academic_resources(department);
CREATE INDEX idx_resources_uploaded_by ON academic_resources(uploaded_by_id);

CREATE TABLE rides (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    creator_id BIGINT NOT NULL,
    start_location VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    ride_date DATE NOT NULL,
    ride_time TIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    vehicle_info VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ride_creator FOREIGN KEY (creator_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_ride_seats CHECK (
        total_seats > 0 AND available_seats >= 0 AND available_seats <= total_seats
    ),
    CONSTRAINT chk_ride_status CHECK (status IN ('ACTIVE','FULL','CANCELLED','COMPLETED'))
);

CREATE INDEX idx_rides_creator ON rides(creator_id);
CREATE INDEX idx_rides_date ON rides(ride_date);
CREATE INDEX idx_rides_destination ON rides(destination);

CREATE TABLE ride_bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ride_id BIGINT NOT NULL,
    passenger_id BIGINT NOT NULL,
    seats_booked INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
    booked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME NULL,
    CONSTRAINT fk_booking_ride FOREIGN KEY (ride_id) REFERENCES rides(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_booking_passenger FOREIGN KEY (passenger_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_ride_passenger UNIQUE (ride_id, passenger_id),
    CONSTRAINT chk_booked_seats CHECK (seats_booked > 0),
    CONSTRAINT chk_booking_status CHECK (status IN ('BOOKED','CANCELLED'))
);

CREATE INDEX idx_ride_bookings_ride ON ride_bookings(ride_id);
CREATE INDEX idx_ride_bookings_passenger ON ride_bookings(passenger_id);

CREATE TABLE teams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    leader_id BIGINT NOT NULL,
    team_name VARCHAR(150) NOT NULL,
    project_name VARCHAR(200),
    description TEXT,
    required_skills TEXT,
    members_required INT NOT NULL,
    current_members_count INT NOT NULL DEFAULT 1,
    deadline DATE,
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_team_leader FOREIGN KEY (leader_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_team_capacity CHECK (
        members_required > 0 AND current_members_count >= 0
        AND current_members_count <= members_required
    ),
    CONSTRAINT chk_team_status CHECK (status IN ('OPEN','FULL','CLOSED','CANCELLED'))
);

CREATE INDEX idx_teams_leader ON teams(leader_id);
CREATE INDEX idx_teams_category ON teams(category);

CREATE TABLE team_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_in_team VARCHAR(100),
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_team_member_team FOREIGN KEY (team_id) REFERENCES teams(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_team_member_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_team_user UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

CREATE TABLE team_join_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    CONSTRAINT fk_join_request_team FOREIGN KEY (team_id) REFERENCES teams(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_join_request_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_join_request_status CHECK (
        status IN ('PENDING','APPROVED','REJECTED','CANCELLED')
    )
);

CREATE INDEX idx_join_requests_team ON team_join_requests(team_id);
CREATE INDEX idx_join_requests_user ON team_join_requests(user_id);

CREATE TABLE marketplace_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    seller_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    item_condition VARCHAR(50),
    image_url VARCHAR(500),
    contact_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_marketplace_seller FOREIGN KEY (seller_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_marketplace_price CHECK (price >= 0),
    CONSTRAINT chk_marketplace_status CHECK (
        status IN ('AVAILABLE','SOLD','RESERVED','REMOVED')
    )
);

CREATE INDEX idx_marketplace_seller ON marketplace_items(seller_id);
CREATE INDEX idx_marketplace_category ON marketplace_items(category);
CREATE INDEX idx_marketplace_status ON marketplace_items(status);

CREATE TABLE lost_found_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reported_by_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    location VARCHAR(200),
    incident_date DATE,
    image_url VARCHAR(500),
    contact_info VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    claimed_by_id BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lost_found_reporter FOREIGN KEY (reported_by_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_lost_found_claimed_by FOREIGN KEY (claimed_by_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_lost_found_type CHECK (item_type IN ('LOST','FOUND')),
    CONSTRAINT chk_lost_found_status CHECK (
        status IN ('PENDING','ACTIVE','CLAIMED','RESOLVED','REJECTED')
    )
);

CREATE INDEX idx_lost_found_reporter ON lost_found_items(reported_by_id);
CREATE INDEX idx_lost_found_status ON lost_found_items(status);
CREATE INDEX idx_lost_found_location ON lost_found_items(location);

CREATE TABLE roommate_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    preferred_location VARCHAR(200),
    budget_range VARCHAR(100),
    occupancy_preference VARCHAR(100),
    lifestyle VARCHAR(500),
    study_habits VARCHAR(500),
    food_preference VARCHAR(200),
    sleep_schedule VARCHAR(200),
    interests TEXT,
    bio TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roommate_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_roommate_location ON roommate_profiles(preferred_location);
CREATE INDEX idx_roommate_active ON roommate_profiles(active);

CREATE TABLE student_posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    attachment_url VARCHAR(500),
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_post_likes CHECK (likes_count >= 0),
    CONSTRAINT chk_post_comments CHECK (comments_count >= 0)
);

CREATE INDEX idx_posts_author ON student_posts(author_id);
CREATE INDEX idx_posts_category ON student_posts(category);
CREATE INDEX idx_posts_created ON student_posts(created_at);

CREATE TABLE post_comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES student_posts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_comments_post ON post_comments(post_id);
CREATE INDEX idx_comments_author ON post_comments(author_id);

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    target_entity_type VARCHAR(100),
    target_entity_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    actor_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
