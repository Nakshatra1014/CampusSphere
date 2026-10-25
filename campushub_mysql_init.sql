-- =======================================================================
-- CAMPUSHUB: Smart College Campus Management Platform
-- MySQL Database Schema & Initial Seed Dataset
-- Compatibility: MySQL 8.0+ / MariaDB 10.5+
-- =======================================================================

CREATE DATABASE IF NOT EXISTS `campushub_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `campushub_db`;

-- -----------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `post_comments`;
DROP TABLE IF EXISTS `student_posts`;
DROP TABLE IF EXISTS `roommate_profiles`;
DROP TABLE IF EXISTS `lost_found_items`;
DROP TABLE IF EXISTS `marketplace_items`;
DROP TABLE IF EXISTS `team_join_requests`;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `ride_bookings`;
DROP TABLE IF EXISTS `rides`;
DROP TABLE IF EXISTS `academic_resources`;
DROP TABLE IF EXISTS `internship_applications`;
DROP TABLE IF EXISTS `internships`;
DROP TABLE IF EXISTS `event_registrations`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `department` VARCHAR(100) NULL,
    `academic_year` VARCHAR(50) NULL,
    `phone` VARCHAR(30) NULL,
    `bio` TEXT NULL,
    `skills` TEXT NULL,
    `profile_image_url` VARCHAR(500) NULL,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 2. EVENTS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `events` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `event_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `venue` VARCHAR(200) NOT NULL,
    `eligibility` VARCHAR(255) NULL,
    `organizer_id` BIGINT NOT NULL,
    `max_participants` INT NOT NULL,
    `registration_deadline` DATETIME NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `rejection_reason` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_event_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 3. EVENT REGISTRATIONS TABLE (UNIQUE per user & event, never deleted)
-- -----------------------------------------------------------------------
CREATE TABLE `event_registrations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `event_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    `registered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `cancelled_at` DATETIME NULL,
    CONSTRAINT `uk_event_user_registration` UNIQUE (`event_id`, `user_id`),
    CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 4. INTERNSHIPS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `internships` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `company_name` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(150) NOT NULL,
    `work_mode` VARCHAR(30) NOT NULL,
    `stipend` VARCHAR(100) NULL,
    `duration` VARCHAR(100) NULL,
    `eligibility` VARCHAR(255) NULL,
    `skills_required` TEXT NULL,
    `application_deadline` DATE NOT NULL,
    `application_link` VARCHAR(500) NULL,
    `posted_by_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_internship_posted_by` FOREIGN KEY (`posted_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 5. INTERNSHIP APPLICATIONS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `internship_applications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `internship_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `resume_url` VARCHAR(500) NULL,
    `cover_note` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `uk_internship_user_application` UNIQUE (`internship_id`, `user_id`),
    CONSTRAINT `fk_app_internship` FOREIGN KEY (`internship_id`) REFERENCES `internships` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 6. ACADEMIC RESOURCES TABLE (Faculty only upload)
-- -----------------------------------------------------------------------
CREATE TABLE `academic_resources` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `subject` VARCHAR(150) NOT NULL,
    `department` VARCHAR(100) NOT NULL,
    `semester` INT NOT NULL,
    `resource_type` VARCHAR(50) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_name` VARCHAR(255) NULL,
    `file_size` BIGINT NULL,
    `tags` VARCHAR(255) NULL,
    `uploaded_by_id` BIGINT NOT NULL,
    `download_count` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_resource_uploaded_by` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 7. RIDES TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `rides` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `start_location` VARCHAR(200) NOT NULL,
    `destination` VARCHAR(200) NOT NULL,
    `ride_date` DATE NOT NULL,
    `ride_time` TIME NOT NULL,
    `total_seats` INT NOT NULL,
    `available_seats` INT NOT NULL,
    `vehicle_info` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `creator_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_ride_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 8. RIDE BOOKINGS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `ride_bookings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `ride_id` BIGINT NOT NULL,
    `passenger_id` BIGINT NOT NULL,
    `seats_booked` INT NOT NULL DEFAULT 1,
    `status` VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    `booked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `uk_ride_passenger` UNIQUE (`ride_id`, `passenger_id`),
    CONSTRAINT `fk_booking_ride` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_booking_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 9. TEAMS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `teams` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `team_name` VARCHAR(150) NOT NULL,
    `project_name` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `required_skills` TEXT NOT NULL,
    `members_required` INT NOT NULL,
    `deadline` DATE NOT NULL,
    `leader_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'RECRUITING',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_team_leader` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 10. TEAM MEMBERS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `team_members` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `team_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `role_in_team` VARCHAR(100) NOT NULL,
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `uk_team_member` UNIQUE (`team_id`, `user_id`),
    CONSTRAINT `fk_member_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_member_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 11. TEAM JOIN REQUESTS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `team_join_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `team_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `message` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `responded_at` DATETIME NULL,
    CONSTRAINT `uk_team_join_request` UNIQUE (`team_id`, `user_id`),
    CONSTRAINT `fk_request_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_request_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 12. MARKETPLACE ITEMS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `marketplace_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `item_condition` VARCHAR(30) NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `contact_phone` VARCHAR(30) NULL,
    `seller_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_marketplace_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 13. LOST & FOUND ITEMS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `lost_found_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `type` VARCHAR(20) NOT NULL, -- 'LOST' or 'FOUND'
    `location` VARCHAR(200) NOT NULL,
    `incident_date` DATE NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `contact_info` VARCHAR(255) NULL,
    `claim_note` TEXT NULL,
    `reported_by_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_lost_found_reporter` FOREIGN KEY (`reported_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 14. ROOMMATE PROFILES TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `roommate_profiles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `academic_year` VARCHAR(50) NULL,
    `budget_min` DECIMAL(10,2) NOT NULL,
    `budget_max` DECIMAL(10,2) NOT NULL,
    `preferred_location` VARCHAR(200) NOT NULL,
    `gender_preference` VARCHAR(20) NOT NULL,
    `cleanliness` VARCHAR(50) NOT NULL,
    `sleep_habits` VARCHAR(50) NOT NULL,
    `dietary_preference` VARCHAR(100) NULL,
    `occupancy_type` VARCHAR(100) NULL,
    `lifestyle_notes` TEXT NULL,
    `contact_phone` VARCHAR(30) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_roommate_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 15. STUDENT COMMUNITY POSTS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `student_posts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `tags` VARCHAR(255) NULL,
    `author_id` BIGINT NOT NULL,
    `like_count` INT NOT NULL DEFAULT 0,
    `comment_count` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 16. POST COMMENTS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `post_comments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `post_id` BIGINT NOT NULL,
    `author_id` BIGINT NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `student_posts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 17. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `recipient_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `reference_id` BIGINT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notification_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 18. AUDIT LOGS TABLE
-- -----------------------------------------------------------------------
CREATE TABLE `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `action` VARCHAR(100) NOT NULL,
    `actor_id` BIGINT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` BIGINT NULL,
    `details` TEXT NULL,
    `ip_address` VARCHAR(50) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =======================================================================
-- INITIAL SEED DATASET
-- BCrypt Password Hash for 'password123':
-- $2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.
-- =======================================================================

-- 1. Insert Initial Users (11 records across Student, Faculty, Admin)
INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `role`, `department`, `academic_year`, `phone`, `bio`, `skills`, `profile_image_url`, `active`) VALUES
(1, 'student@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Aarav Sharma', 'ROLE_STUDENT', 'Computer Science & Engineering', 'Year 3', '+1 (555) 234-5678', 'CS Undergraduate passionate about Full-Stack Web Development, Distributed Systems, and AI.', 'React, Java, Spring Boot, MySQL, Python, Git', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', TRUE),
(2, 'priya.patel@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Priya Patel', 'ROLE_STUDENT', 'Information Technology', 'Year 2', '+1 (555) 876-5432', 'IT sophomore eager to participate in hackathons and open-source campus initiatives.', 'JavaScript, UI/UX Design, Figma, CSS, Node.js', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', TRUE),
(3, 'faculty@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Dr. Evelyn Reed', 'ROLE_FACULTY', 'Computer Science & Engineering', 'Faculty', '+1 (555) 345-6789', 'Associate Professor in Computer Science. Research focus: Cloud Computing and Distributed Systems.', 'Distributed Systems, Cloud Architecture, Algorithms, Java Enterprise', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', TRUE),
(4, 'faculty2@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Prof. Marcus Vance', 'ROLE_FACULTY', 'Electrical Engineering', 'Faculty', '+1 (555) 456-7890', 'Professor in Electrical & Electronics Engineering.', 'Embedded Systems, IoT, Microcontrollers', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', TRUE),
(5, 'admin@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Campus Admin', 'ROLE_ADMIN', 'University Central Administration', 'Staff', '+1 (555) 100-0001', 'CampusHub Central Platform Administration and Content Moderation Desk.', 'System Administration, Moderation, Academic Policies', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', TRUE),
(6, 'rohan.gupta@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Rohan Gupta', 'ROLE_STUDENT', 'Mechanical Engineering', 'Year 3', '+1 (555) 333-1122', 'Robotics enthusiast, CAD design specialist, and 3D printing hobbyist.', 'SolidWorks, AutoCAD, Python, C++, ROS', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', TRUE),
(7, 'ananya.deshmukh@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Ananya Deshmukh', 'ROLE_STUDENT', 'Electronics & Communication', 'Year 3', '+1 (555) 444-2233', 'Embedded systems and IoT device developer exploring microcontrollers and edge intelligence.', 'C, Embedded C, Verilog, Arduino, Raspberry Pi', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', TRUE),
(8, 'vikram.singh@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Vikram Singh', 'ROLE_STUDENT', 'Civil Engineering', 'Year 4', '+1 (555) 555-3344', 'Final-year civil engineering student focusing on smart structural modeling and GIS.', 'Revit, STAAD Pro, ArcGIS, MATLAB', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', TRUE),
(9, 'sneha.reddy@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Sneha Reddy', 'ROLE_STUDENT', 'Data Science & AI', 'Year 2', '+1 (555) 666-4455', 'Data Science major interested in computer vision, deep learning, and predictive models.', 'Python, TensorFlow, PyTorch, Pandas, SQL, Tableau', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', TRUE),
(10, 'rahul.verma@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Rahul Verma', 'ROLE_STUDENT', 'Computer Science & Engineering', 'Year 2', '+1 (555) 777-5566', 'Competitive programmer, data structures enthusiast, and open-source contributor.', 'C++, Java, Algorithms, Git, Linux', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', TRUE),
(11, 'faculty.kapoor@campushub.edu', '$2a$10$wNq.7cEq9d.Nn48U5Wp1z.1dYw4Zz0u1Fq.u7gB4aMqv0BqgM0qE.', 'Dr. Alok Kapoor', 'ROLE_FACULTY', 'Mechanical Engineering', 'Faculty', '+1 (555) 567-8901', 'Head of Department, Mechanical Engineering. Thermal sciences and propulsion systems.', 'Thermodynamics, Fluid Dynamics, CFD', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150', TRUE);

-- 2. Insert Events (11 records)
INSERT INTO `events` (`id`, `title`, `description`, `category`, `event_date`, `start_time`, `end_time`, `venue`, `eligibility`, `organizer_id`, `max_participants`, `registration_deadline`, `image_url`, `status`) VALUES
(1, 'Campus CodeSprint 2026: 24h Hackathon', 'Annual university-wide 24-hour hackathon focused on sustainable smart campus applications, AI automation, and cloud tooling. Cash prizes and mentor sessions included.', 'Hackathon', DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), '09:00:00', '18:00:00', 'Main University Auditorium & CS Labs', 'All Undergraduate & Postgraduate Students', 3, 120, DATE_ADD(NOW(), INTERVAL 8 DAY), 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', 'APPROVED'),
(2, 'Workshop: Advanced Spring Boot & Microservices', 'Hands-on 4-hour workshop covering REST architecture, JPA best practices, Spring Security with JWT, and Docker containerization.', 'Workshop', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), '14:00:00', '18:00:00', 'Seminar Hall 3B, CSE Block', 'Year 2, 3, and 4 CSE/IT Students', 3, 60, DATE_SUB(NOW(), INTERVAL 12 HOUR), 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600', 'APPROVED'),
(3, 'Cybersecurity CTF & Ethical Hacking Lab', 'Competitive Capture The Flag challenges covering web vulnerabilities, reverse engineering, and cryptography.', 'Competition', DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY), '10:00:00', '16:00:00', 'Cyber Lab 1, Tech Building', 'All enrolled students', 4, 2, DATE_ADD(NOW(), INTERVAL 4 DAY), 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600', 'APPROVED'),
(4, 'RoboWars & Autonomous Drone Racing Expo', 'Exhibition and speed competition for campus robotics enthusiasts and autonomous drone builders.', 'Competition', DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), '10:00:00', '17:00:00', 'Open Ground Complex', 'Open to all departments', 1, 200, DATE_ADD(NOW(), INTERVAL 20 DAY), 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', 'PENDING'),
(5, 'AI & Machine Learning Innovation Summit', 'Keynote sessions and paper presentations on LLMs, Generative AI in education, and autonomous robotics.', 'Seminar', DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), '09:30:00', '16:30:00', 'Auditorium Hall 2', 'All students and faculty members', 3, 150, DATE_ADD(NOW(), INTERVAL 12 DAY), 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', 'APPROVED'),
(6, 'Annual University Cultural Fest: Rhythm 2026', 'The largest annual inter-college celebration featuring live band music, choreography contests, theatre, and food stalls.', 'Cultural', DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), '16:00:00', '22:00:00', 'Campus Amphitheatre & Central Lawns', 'All University Students & Guests', 2, 500, DATE_ADD(NOW(), INTERVAL 26 DAY), 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600', 'APPROVED'),
(7, 'Industry Career Fair & Placement Connect', 'Meet talent acquisition leaders from 40+ leading tech, finance, and engineering companies for on-campus interviews.', 'Career', DATE_ADD(CURRENT_DATE, INTERVAL 18 DAY), '09:00:00', '17:00:00', 'Indoor Sports Complex Exhibition Area', 'Pre-final and Final Year Students', 11, 300, DATE_ADD(NOW(), INTERVAL 14 DAY), 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600', 'APPROVED'),
(8, 'Campus Esports Championship: Valorant & FIFA', 'Competitive collegiate gaming tournament with bracket elimination, live shoutcasting, and hardware prizes.', 'Sports', DATE_ADD(CURRENT_DATE, INTERVAL 8 DAY), '13:00:00', '20:00:00', 'Student Recreation Center - eSports Arena', 'All enrolled university gamers', 10, 64, DATE_ADD(NOW(), INTERVAL 5 DAY), 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', 'APPROVED'),
(9, 'Photography & Visual Arts Gallery Exhibition', 'Showcase of outstanding student architectural renders, landscape photography, and oil paintings.', 'Exhibition', DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), '11:00:00', '18:00:00', 'Fine Arts Gallery & Architecture Atrium', 'Open to all campus visitors', 8, 80, DATE_ADD(NOW(), INTERVAL 10 DAY), 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600', 'APPROVED'),
(10, 'Red Cross Campus Blood Donation Drive', 'Annual humanitarian blood donation drive organized in partnership with City Central Blood Bank and Red Cross.', 'Community', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), '09:00:00', '15:00:00', 'Health Center Activity Wing', 'Healthy students and faculty aged 18+', 9, 100, DATE_ADD(NOW(), INTERVAL 3 DAY), 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600', 'APPROVED'),
(11, 'Full-Stack Cloud & WebDev Masterclass', 'Interactive Saturday workshop on modern full-stack development with Next.js, Spring Boot, and cloud deployment.', 'Workshop', DATE_ADD(CURRENT_DATE, INTERVAL 16 DAY), '10:00:00', '16:00:00', 'CS Seminar Hall A', 'Open to all CS & IT students', 3, 80, DATE_ADD(NOW(), INTERVAL 13 DAY), 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', 'APPROVED');

-- 3. Insert Event Registrations
INSERT INTO `event_registrations` (`id`, `event_id`, `user_id`, `status`, `registered_at`) VALUES
(1, 3, 1, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 3, 2, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 4. Insert Internships (11 records)
INSERT INTO `internships` (`id`, `title`, `company_name`, `description`, `location`, `work_mode`, `stipend`, `duration`, `eligibility`, `skills_required`, `application_deadline`, `posted_by_id`, `application_link`, `status`) VALUES
(1, 'Software Engineering Intern - Cloud Platforms', 'Nexus Cloud Technologies', 'Looking for motivated student interns to assist in backend REST API engineering, distributed caching, and automated integration testing.', 'Seattle, WA (or Remote)', 'REMOTE', '$1,500 / month', '3 Months (Summer 2026)', 'Pre-final & Final Year Students with Java/C++ background', 'Java, Spring Boot, MySQL, REST APIs, Git', CURRENT_DATE, 3, 'https://careers.nexuscloud.io/internships/se-2026', 'ACTIVE'),
(2, 'Frontend Developer & UI/UX Intern', 'InnovateEdu Labs', 'Collaborate with our product team to build responsive educational dashboards using React.js and Material UI components.', 'Campus Innovation Park', 'HYBRID', '$1,000 / month', '6 Months', 'CGPA > 7.0, Portfolio of React web apps', 'React, JavaScript, Material UI, CSS3, Responsive Design', DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 1, 'https://innovateedu.io/apply', 'ACTIVE'),
(3, 'Embedded Systems Research Assistant', 'IoT Innovation Lab', 'Assist in firmware development for sensor networks and microcontrollers.', 'Electrical Engineering Block', 'ON_SITE', '$800 / month', '4 Months', 'EE and ECE students', 'C, C++, RTOS, Arduino', DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 4, '', 'ACTIVE'),
(4, 'Machine Learning & NLP Research Intern', 'CognitiveAI Research Labs', 'Train fine-tuned Transformer models, build RAG pipelines, and curate evaluation datasets for scientific literature summarization.', 'San Francisco, CA (Remote Option)', 'REMOTE', '$1,800 / month', '3 Months', 'Strong Python skills and background in ML/PyTorch', 'Python, PyTorch, Hugging Face, NLP, Vector DBs', DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 3, 'https://cognitiveai.example.com/apply', 'ACTIVE'),
(5, 'Data Analyst & Business Intelligence Intern', 'FinTech Global Solutions', 'Analyze student financial patterns, automate metric dashboards, and generate KPI reporting pipelines.', 'New York, NY', 'HYBRID', '$1,200 / month', '4 Months', 'Proficiency in SQL and Data Visualization', 'SQL, PowerBI, Tableau, Python, Excel', DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), 11, 'https://fintechglobal.example.com/careers', 'ACTIVE'),
(6, 'Cybersecurity Defense & Pen Testing Intern', 'SecureNet Defense', 'Participate in network traffic monitoring, vulnerability scanning, and security audit remediation on enterprise systems.', 'Austin, TX', 'REMOTE', '$1,400 / month', '3 Months', 'Knowledge of TCP/IP, Linux, and web vulnerabilities (OWASP)', 'Linux, Wireshark, Burp Suite, Python, Bash', DATE_ADD(CURRENT_DATE, INTERVAL 18 DAY), 3, 'https://securenet.example.com/interns', 'ACTIVE'),
(7, 'Cloud Infrastructure & DevOps Intern', 'Skyline Cloud Services', 'Build CI/CD pipelines, configure Kubernetes clusters, and automate cloud provisioning with Terraform.', 'Seattle, WA', 'HYBRID', '$1,300 / month', '6 Months', 'Familiarity with Docker, Linux, and AWS/GCP basics', 'Docker, Kubernetes, GitHub Actions, AWS, Terraform', DATE_ADD(CURRENT_DATE, INTERVAL 22 DAY), 4, 'https://skylinecloud.example.com/devops-intern', 'ACTIVE'),
(8, 'Mobile Application Developer (Flutter/React Native)', 'Pulse HealthTech', 'Build mobile features for health vitals tracking and telemedicine scheduling on iOS and Android.', 'Boston, MA', 'REMOTE', '$1,100 / month', '4 Months', 'Prior app development experience in Flutter or React Native', 'Flutter, Dart, React Native, REST APIs, Firebase', DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 1, 'https://pulsehealth.example.com/jobs', 'ACTIVE'),
(9, 'Robotics & Firmware Engineering Intern', 'Apex Robotics Corporation', 'Develop motor control algorithms and CAN bus telemetry for autonomous ground exploration vehicles.', 'Detroit, MI', 'ON_SITE', '$1,250 / month', '5 Months', 'Mechanical or Mechatronics students with C++ experience', 'C++, ROS2, Control Systems, MATLAB, Git', DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 11, 'https://apexrobotics.example.com/careers', 'ACTIVE'),
(10, 'Product Design & UI/UX Strategy Intern', 'CraftUX Studios', 'Conduct user research, design wireframes and high-fidelity prototypes, and build scalable design systems.', 'San Jose, CA', 'REMOTE', '$950 / month', '3 Months', 'Design portfolio demonstrating Figma wireframes and prototypes', 'Figma, User Research, Wireframing, Prototyping, Design Systems', DATE_ADD(CURRENT_DATE, INTERVAL 28 DAY), 2, 'https://craftux.example.com/apply', 'ACTIVE'),
(11, 'Site Reliability & Cloud DevOps Intern', 'Vanguard Cloud Systems', 'Assist in container orchestration, Prometheus monitoring, and automated incident triage on cloud clusters.', 'San Francisco, CA (or Remote)', 'REMOTE', '$1,600 / month', '4 Months', 'Students passionate about Linux, Kubernetes, and Golang/Python', 'Linux, Kubernetes, Docker, Prometheus, Python, Go', DATE_ADD(CURRENT_DATE, INTERVAL 24 DAY), 3, 'https://vanguardcloud.example.com/careers', 'ACTIVE');

-- 5. Insert Academic Resources (10 records)
INSERT INTO `academic_resources` (`id`, `title`, `description`, `subject`, `department`, `semester`, `resource_type`, `file_url`, `file_name`, `file_size`, `tags`, `uploaded_by_id`, `download_count`) VALUES
(1, 'Distributed Systems & Consensus Protocols - Lecture Modules', 'Complete semester notes covering Paxos, Raft consensus algorithm, Vector Clocks, Byzantine Fault Tolerance, and CAP Theorem.', 'Distributed Systems (CS601)', 'Computer Science & Engineering', 6, 'Lecture Notes', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'CS601_Distributed_Systems_Complete_Notes.pdf', 4500000, 'Distributed Systems, Raft, Consensus, CAP Theorem', 3, 42),
(2, 'Data Structures and Algorithms - Complete Handout & Code Samples', 'Comprehensive guide to BSTs, AVL Trees, Red-Black Trees, Graphs, Dijkstra, Dynamic Programming, and Amortized Analysis.', 'Data Structures & Algorithms (CS201)', 'Computer Science & Engineering', 3, 'Lecture Notes', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'CS201_DSA_Complete_Compendium.pdf', 6200000, 'DSA, Trees, Graphs, Dynamic Programming, Java', 3, 89),
(3, 'Digital Signal Processing - End-Term Previous Question Papers (2023-2025)', 'Compiled university exam question papers with step-by-step solutions for FFT, Z-Transforms, and FIR/IIR filter design.', 'Digital Signal Processing (EC401)', 'Electronics & Communication', 4, 'Question Paper', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'EC401_DSP_Previous_Exam_Papers_Solved.pdf', 3800000, 'DSP, FFT, Filters, Previous Papers, Solutions', 4, 65),
(4, 'Database Management Systems Lab Manual & SQL Schema Guides', 'Laboratory experiments covering ER modeling, Relational Algebra, complex SQL joins, indexing, and PL/SQL procedures.', 'Database Systems (CS302)', 'Computer Science & Engineering', 4, 'Lab Manual', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'CS302_DBMS_Lab_Manual_2026.pdf', 2900000, 'DBMS, SQL, Relational Algebra, Indexes, Stored Procedures', 3, 114),
(5, 'Machine Learning & Pattern Recognition Course Compendium', 'Mathematical formulations for Linear Regression, SVMs, Neural Networks, PCA, Decision Forests, and Gradient Boosting.', 'Machine Learning (DS501)', 'Data Science & AI', 5, 'Reference Material', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'DS501_Machine_Learning_Theory_Reference.pdf', 5400000, 'Machine Learning, Mathematics, SVM, Neural Networks, PCA', 3, 78),
(6, 'Thermodynamics & Heat Transfer Fundamentals Notes', 'First and Second Laws of Thermodynamics, Carnot cycle, entropy balances, heat exchangers, and conduction/convection.', 'Thermodynamics (ME301)', 'Mechanical Engineering', 3, 'Lecture Notes', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'ME301_Thermodynamics_Full_Notes.pdf', 4100000, 'Thermodynamics, Carnot, Entropy, Heat Transfer', 11, 33),
(7, 'Computer Networks Lab Guide: Packet Tracer & Wireshark Labs', 'Hands-on lab experiments for IP subnetting, VLAN configuration, OSPF routing, DNS, DHCP, and HTTP packet inspection.', 'Computer Networks (IT402)', 'Information Technology', 4, 'Lab Manual', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'IT402_Computer_Networks_Lab_Manual.pdf', 3300000, 'Networking, Wireshark, Packet Tracer, Subnetting, Routing', 3, 57),
(8, 'Structural Analysis & RCC Design Previous Exam Question Papers', '5-year question bank with numerical solutions for bending moment diagrams, shear forces, and reinforced concrete beam design.', 'Structural Analysis (CE501)', 'Civil Engineering', 5, 'Question Paper', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'CE501_Structural_Analysis_Exam_Bank.pdf', 4800000, 'Civil, RCC, Structural Analysis, Question Bank', 11, 41),
(9, 'Object-Oriented Software Engineering - UML Diagrams & Design Patterns', 'Design patterns catalogue (Creational, Structural, Behavioral) with real-world case studies and PlantUML diagrams.', 'Software Engineering (CS403)', 'Computer Science & Engineering', 4, 'Lecture Notes', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'CS403_OOSE_Design_Patterns_Guide.pdf', 3600000, 'UML, Design Patterns, SOLID Principles, Architecture', 3, 92),
(10, 'Operating Systems Architecture - Virtual Memory & Scheduling Manual', 'Deep dive into Linux kernel scheduling (CFS), paging, TLB translation, synchronization primitives (mutexes, semaphores).', 'Operating Systems (CS301)', 'Computer Science & Engineering', 3, 'Lecture Notes', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'CS301_Operating_Systems_Core_Architecture.pdf', 5100000, 'Operating Systems, Virtual Memory, Kernel, Scheduling, Threads', 3, 120);

-- 6. Insert Rides (11 records)
INSERT INTO `rides` (`id`, `start_location`, `destination`, `ride_date`, `ride_time`, `total_seats`, `available_seats`, `vehicle_info`, `notes`, `creator_id`, `status`) VALUES
(1, 'Campus North Gate Gatehouse', 'Central Train & Bus Terminal', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), '17:30:00', 3, 2, 'Silver Honda Civic (Plate: ABC-4589)', 'Splitting highway toll. Leaving right after CS lab finishes at 5:15 PM.', 1, 'ACTIVE'),
(2, 'University Main Gate', 'International Airport Terminal 2', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), '08:00:00', 4, 3, 'White Toyota Camry (Plate: DEF-1029)', 'Direct ride to airport for weekend flights. Plenty of trunk space for luggage.', 6, 'ACTIVE'),
(3, 'Engineering Block Bus Bay', 'Downtown Tech Park', DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), '09:15:00', 3, 1, 'Blue Hyundai Elantra (Plate: GHI-3341)', 'Daily commute to tech park for morning research meetings. 2 seats already booked.', 7, 'ACTIVE'),
(4, 'South Campus Hostel Complex', 'Metro Central Station', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), '16:45:00', 4, 4, 'Grey Volkswagen Jetta (Plate: JKL-7720)', 'Comfortable AC ride. Playing upbeat road trip playlist.', 8, 'ACTIVE'),
(5, 'City Center Mall', 'Campus Student Housing', DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), '21:00:00', 3, 0, 'Black Honda Accord (Plate: MNO-9012)', 'Night return trip from shopping center. Fully booked.', 10, 'FULL'),
(6, 'Campus West Gate', 'Railway Station Junction', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), '06:30:00', 4, 2, 'Red Kia Forte (Plate: PQR-5561)', 'Early morning ride to catch intercity express train. Punctual departure guaranteed.', 8, 'ACTIVE'),
(7, 'North Campus Library', 'Silicon Suburb Business Hub', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), '13:00:00', 3, 3, 'White Nissan Altima (Plate: STU-8834)', 'Mid-day trip for internship interviews.', 9, 'ACTIVE'),
(8, 'University Sports Complex', 'Old Town Farmers Market', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), '10:00:00', 4, 2, 'Silver Mazda 3 (Plate: VWX-2219)', 'Weekend grocery and organic market trip. Welcome to join!', 2, 'ACTIVE'),
(9, 'Campus Innovation Park', 'Expressway Toll Plaza', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), '18:00:00', 3, 1, 'Dark Grey Ford Focus (Plate: YZA-4401)', 'Splitting expressway toll fare evenly.', 1, 'ACTIVE'),
(10, 'Student Union Building', 'Lakeview Residential District', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), '19:30:00', 4, 4, 'Blue Chevrolet Cruze (Plate: BCD-6650)', 'Evening ride dropping passengers along Lakeview boulevard.', 6, 'ACTIVE'),
(11, 'Campus East Gate', 'North Suburb IT Corridor', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), '08:45:00', 4, 3, 'Silver Honda City (Plate: EFG-8890)', 'Comfortable daily morning carpool to tech offices and IT corridor.', 7, 'ACTIVE');

-- 7. Insert Ride Bookings
INSERT INTO `ride_bookings` (`id`, `ride_id`, `passenger_id`, `seats_booked`, `status`, `booked_at`) VALUES
(1, 1, 2, 1, 'CONFIRMED', NOW()),
(2, 5, 9, 2, 'CONFIRMED', NOW()),
(3, 5, 8, 1, 'CONFIRMED', NOW());

-- 8. Insert Teams (10 records)
INSERT INTO `teams` (`id`, `team_name`, `project_name`, `description`, `category`, `required_skills`, `members_required`, `deadline`, `leader_id`, `status`) VALUES
(1, 'CampusAI Solvers', 'Smart Automated Attendance & Resource Allocator', 'Building an edge AI based campus resource scheduling and attendance verification portal for the upcoming University Hackathon.', 'Hackathon', 'Python, Computer Vision, React, REST APIs', 3, DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), 1, 'RECRUITING'),
(2, 'CyberShield Squad', 'Zero-Trust Campus Security & Vulnerability Scanner', 'Developing automated container vulnerability scanners and identity access auditing for campus lab servers.', 'Competition', 'Go, Docker, Linux Security, Penetration Testing', 4, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 2, 'RECRUITING'),
(3, 'GreenCampus Tech', 'IoT Solar Power & Energy Consumption Optimizer', 'Deploying wireless IoT sensor nodes across campus rooftops to monitor real-time solar inverter efficiency.', 'Academic Project', 'Embedded C, ESP32, MQTT, Time-Series Databases', 3, DATE_ADD(CURRENT_DATE, INTERVAL 18 DAY), 6, 'RECRUITING'),
(4, 'FinTrack Pioneers', 'Micro-Investment & Budgeting App for College Students', 'Mobile banking assistant offering automated round-up savings, peer bill splitting, and campus meal voucher management.', 'Hackathon', 'Flutter, Node.js, PostgreSQL, Plaid API', 4, DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 7, 'RECRUITING'),
(5, 'NeuroVision Labs', 'Medical Imaging & Diagnostic Assistance with Deep Learning', 'Research collaboration building 3D Convolutional networks for lung CT nodule classification and report generation.', 'Research', 'PyTorch, DICOM, Computer Vision, FastAPI', 3, DATE_ADD(CURRENT_DATE, INTERVAL 22 DAY), 9, 'RECRUITING'),
(6, 'Autonomous Rover Devs', 'University Rover Challenge 2026 Navigation Module', 'Designing autonomous waypoint traversal, obstacle avoidance with LiDAR, and robotic arm inverse kinematics.', 'Competition', 'ROS2, C++, SLAM, Python, OpenCV', 5, DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), 6, 'RECRUITING'),
(7, 'EduVR Innovators', 'Interactive 3D Virtual Anatomy & Science Lab Simulator', 'Creating WebXR and Oculus experiences allowing medical and biology students to dissect virtual specimens.', 'Academic Project', 'Unity, C#, Blender, WebXR, Three.js', 3, DATE_ADD(CURRENT_DATE, INTERVAL 24 DAY), 8, 'RECRUITING'),
(8, 'CampusRide Express', 'Dynamic Carpooling & Micro-Mobility Dispatch Platform', 'Algorithmic route grouping and safety tracking for student carpools and electric scooter fleets.', 'Hackathon', 'Spring Boot, Graphhopper, Redis, React Native', 4, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 10, 'RECRUITING'),
(9, 'OpenSource Guild', 'University Open Source Documentation & Tooling Suite', 'Building developer productivity CLI tools, campus documentation portals, and automated syllabus scrapers.', 'Academic Project', 'TypeScript, Go, Markdown, GitHub Actions', 2, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 1, 'RECRUITING'),
(10, 'GameCraft Studio', '2D Pixel Art Roguelike Adventure Game for Global Game Jam', 'Developing a procedural dungeon crawler with retro 16-bit chiptune audio and emergent physics mechanics.', 'Competition', 'Godot, GDScript, Pixel Art, Audio Design', 4, DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), 10, 'RECRUITING');

-- 9. Insert Team Members
INSERT INTO `team_members` (`id`, `team_id`, `user_id`, `role_in_team`, `joined_at`) VALUES
(1, 1, 1, 'Team Leader', NOW()),
(2, 1, 2, 'Frontend Developer', NOW()),
(3, 2, 2, 'Security Analyst & Lead', NOW()),
(4, 3, 6, 'Hardware Architect', NOW()),
(5, 4, 7, 'Lead Mobile Dev', NOW()),
(6, 5, 9, 'AI Researcher', NOW()),
(7, 6, 6, 'Mechanical Lead', NOW()),
(8, 6, 7, 'Electronics Lead', NOW()),
(9, 7, 8, '3D Artist & Lead', NOW()),
(10, 8, 10, 'Backend Architect', NOW());

-- 10. Insert Marketplace Items (10 records)
INSERT INTO `marketplace_items` (`id`, `title`, `description`, `category`, `price`, `item_condition`, `image_url`, `contact_phone`, `seller_id`, `status`) VALUES
(1, 'Introduction to Algorithms (CLRS 4th Edition) - Hardcover', 'Excellent condition, zero pen marks or highlights. Essential textbook for Algorithms and Competitive Programming courses.', 'Books', 45.00, 'LIKE_NEW', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', '+1 (555) 234-5678', 1, 'AVAILABLE'),
(2, 'Texas Instruments TI-84 Plus CE Graphing Calculator', 'Color screen, rechargeable battery, cable included. Perfect for calculus, statistics, and linear algebra.', 'Calculator', 75.00, 'LIKE_NEW', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400', '+1 (555) 876-5432', 2, 'AVAILABLE'),
(3, 'Dell UltraSharp 24-inch Full HD IPS Monitor (1080p, 75Hz)', 'Pivot, tilt, and height adjustable stand. HDMI and DisplayPort inputs. Great dual-monitor setup for coding.', 'Electronics', 110.00, 'GOOD', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', '+1 (555) 333-1122', 6, 'AVAILABLE'),
(4, 'Full Engineering Lab Coat (Size L) & Protective Safety Goggles', 'Clean 100% white cotton lab coat with safety goggles. Compliant with university chemistry and mechanical labs.', 'College Accessories', 18.00, 'LIKE_NEW', 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400', '+1 (555) 444-2233', 7, 'AVAILABLE'),
(5, 'Rotring Rapidograph Technical Drawing Pen & Compass Drafting Kit', 'Complete architectural drawing set with 0.25mm, 0.35mm, and 0.50mm pens plus precision extension compass.', 'Stationery', 32.00, 'GOOD', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400', '+1 (555) 555-3344', 8, 'AVAILABLE'),
(6, 'Arduino Mega 2560 Ultimate Starter Kit with 45+ Sensors', 'Original Arduino Mega microcontroller board, breadboard, LCD display, ultrasonic sensors, motors, and jumper cables.', 'Study Material', 40.00, 'LIKE_NEW', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400', '+1 (555) 666-4455', 9, 'AVAILABLE'),
(7, 'Sony WH-1000XM4 Noise-Cancelling Bluetooth Headphones', 'Industry-leading active noise cancellation. 30-hour battery life. Includes original hard carry case and aux cord.', 'Electronics', 160.00, 'GOOD', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', '+1 (555) 777-5566', 10, 'AVAILABLE'),
(8, 'Ergonomic Mesh Desk Chair with Lumbar Support', 'Breathable black mesh back, adjustable armrests, and smooth casters. Kept in clean non-smoking room.', 'College Accessories', 65.00, 'GOOD', 'https://images.unsplash.com/photo-1580481077195-c9441113b2c9?w=400', '+1 (555) 888-6677', 8, 'AVAILABLE'),
(9, 'Clean Campus Commuter Bicycle with Helmet and Combination Lock', 'Single-speed lightweight aluminum commuter bike. Front and rear handbrakes, new tires, includes sturdy U-lock.', 'College Accessories', 85.00, 'GOOD', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400', '+1 (555) 999-7788', 9, 'AVAILABLE'),
(10, 'Clean Code & Clean Architecture Books Bundle (Robert C. Martin)', 'Classic software engineering book set. Pristine condition with no folded pages. Essential reading for developers.', 'Books', 38.00, 'LIKE_NEW', 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400', '+1 (555) 111-8899', 1, 'AVAILABLE');

-- 11. Insert Lost & Found Items (10 records)
INSERT INTO `lost_found_items` (`id`, `title`, `description`, `category`, `type`, `location`, `incident_date`, `image_url`, `contact_info`, `reported_by_id`, `status`) VALUES
(1, 'Sony Noise Cancelling Headphones (Black Case)', 'Found on desk 14 on the 2nd floor of the central library next to the silent study area.', 'Electronics', 'FOUND', 'Central Library - 2nd Floor Silent Zone', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'Library Helpdesk / priya.patel@campushub.edu', 2, 'ACTIVE'),
(2, 'Navy Blue Herschel Backpack with Notebooks', 'Left behind in auditorium row G after 11 AM calculus lecture. Contains blue spiral notebook and laptop charger.', 'Bags', 'LOST', 'Main Auditorium Hall A', DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'aarav.sharma@campushub.edu / +1 (555) 234-5678', 1, 'ACTIVE'),
(3, 'Casio FX-991EX Scientific Calculator', 'Found on the second bench in Seminar Hall 3B following the afternoon mechanical engineering tutorial.', 'Electronics', 'FOUND', 'Seminar Hall 3B', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400', 'rohan.gupta@campushub.edu', 6, 'ACTIVE'),
(4, 'Campus ID Card & RFID Lanyard - Aarav Sharma', 'Lost student identity card with maroon computer science department lanyard near cafeteria counter.', 'ID Cards', 'LOST', 'Central Cafeteria Counter 2', DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400', 'Campus Security Office / student@campushub.edu', 7, 'ACTIVE'),
(5, 'Apple MacBook Air 67W USB-C Power Adapter & Cable', 'Found plugged into wall socket in Room 204 near the front whiteboard.', 'Electronics', 'FOUND', 'Tech Building Room 204', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400', 'vikram.singh@campushub.edu', 8, 'ACTIVE'),
(6, 'Hydro Flask 32oz Water Bottle (Forest Green)', 'Dark green insulated water bottle with stickers of Python and NASA. Forgotten on bleachers during basketball game.', 'Water Bottles', 'LOST', 'Indoor Sports Complex - Gym Bleachers', DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 'sneha.reddy@campushub.edu', 9, 'ACTIVE'),
(7, 'Black Folding Windproof Umbrella', 'Sturdy compact umbrella with wooden handle left on umbrella rack near main foyer entrance.', 'Other', 'FOUND', 'Student Union Porch', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=400', 'Union Security Desk', 10, 'ACTIVE'),
(8, 'Brown Leather Bi-fold Wallet with Metro Card', 'Contains university bus pass, state driving license, and student discount coupons. Reward if returned!', 'Other', 'LOST', 'Campus North Gate Bus Stop', DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 'tanya.sengupta@campushub.edu', 8, 'ACTIVE'),
(9, 'Apple AirPods Pro (2nd Gen) in White Charging Case', 'Handed to lab assistant after evening operating systems lab practical. Serial number verification required.', 'Electronics', 'FOUND', 'CS Computer Lab 3', DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400', 'karan.mehra@campushub.edu / Lab In-charge', 9, 'ACTIVE'),
(10, 'Ray-Ban Matte Black Prescription Eyeglasses', 'Black rectangular frame with blue light filter coating inside leather case. Lost during study session.', 'Other', 'LOST', 'Central Library Quiet Study Cubicle 7', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400', 'meera.nair@campushub.edu', 1, 'ACTIVE');

-- 12. Insert Roommate Profiles (10 records)
INSERT INTO `roommate_profiles` (`id`, `user_id`, `academic_year`, `budget_min`, `budget_max`, `preferred_location`, `gender_preference`, `cleanliness`, `sleep_habits`, `dietary_preference`, `occupancy_type`, `lifestyle_notes`, `contact_phone`, `is_active`) VALUES
(1, 1, 'Year 3', 500.00, 800.00, 'North Campus Apartments', 'Any', 'Clean', '1 AM - 8 AM', 'Vegetarian', 'Shared (2 people)', 'CS junior looking for a respectful and clean roommate within 10 minutes walking distance from campus.', '+1 (555) 234-5678', TRUE),
(2, 2, 'Year 2', 500.00, 800.00, 'Green View Residency', 'Female', 'Very Clean', '11 PM - 7 AM', 'Vegetarian', 'Shared (2 people)', 'IT sophomore looking for a study-friendly apartment with reliable high-speed fiber internet.', '+1 (555) 876-5432', TRUE),
(3, 6, 'Year 3', 350.00, 500.00, 'University Heights', 'Any', 'Clean', '10 PM - 6 AM', 'Any', 'Shared (2 people)', 'Mechanical engineering student who keeps things organized and enjoys cooking healthy meals.', '+1 (555) 333-1122', TRUE),
(4, 7, 'Year 3', 800.00, 1200.00, 'Sunrise Towers', 'Female', 'Very Clean', '11 PM - 7 AM', 'Vegetarian', 'Single', 'Looking for a quiet single room in a secure apartment with natural sunlight and balcony.', '+1 (555) 444-2233', TRUE),
(5, 8, 'Year 4', 300.00, 500.00, 'Campus West Enclave', 'Male', 'Moderate', '1 AM - 8 AM', 'Any', 'Shared (3+ people)', 'Easygoing senior civil engineering major looking for shared housing near west gate.', '+1 (555) 555-3344', TRUE),
(6, 9, 'Year 2', 800.00, 1100.00, 'Lakeview Suites', 'Female', 'Clean', '10 PM - 6 AM', 'Vegetarian', 'Single', 'Responsible sophomore seeking peaceful studio or 2BHK flat near Lakeview park.', '+1 (555) 666-4455', TRUE),
(7, 10, 'Year 2', 500.00, 800.00, 'Silicon Park Residences', 'Any', 'Clean', 'Flexible', 'Non-Vegetarian', 'Shared (2 people)', 'Fun and focused roommate looking for a fellow coder or STEM major to split rent.', '+1 (555) 777-5566', TRUE),
(8, 5, 'Staff', 500.00, 800.00, 'Downtown Lofts', 'Any', 'Clean', '2 AM - 9 AM', 'Any', 'Shared (2 people)', 'Creative architecture student who values good aesthetics and friendly atmosphere.', '+1 (555) 888-6677', TRUE),
(9, 4, 'Faculty', 400.00, 600.00, 'University Metro Apartments', 'Any', 'Very Clean', '10 PM - 6 AM', 'Vegetarian', 'Shared (2 people)', 'Punctual and tidy final-year student looking for housing right next to metro station.', '+1 (555) 999-7788', TRUE),
(10, 3, 'Faculty', 800.00, 1400.00, 'Royal Palm Residency', 'Any', 'Clean', 'Flexible', 'Any', 'Single', 'First-year management student seeking modern, clean apartment with gym amenities.', '+1 (555) 111-8899', TRUE);

-- 13. Insert Student Community Posts & Comments (10 records)
INSERT INTO `student_posts` (`id`, `title`, `content`, `category`, `tags`, `author_id`, `like_count`, `comment_count`) VALUES
(1, 'Tips for Cracking Technical Coding Interviews & OA Rounds in 2026', 'Here are the top 5 patterns that appeared frequently in campus placement assessments this semester: 1. Sliding Window & Two Pointers, 2. BFS/DFS on Graphs, 3. Dynamic Programming with memoization, 4. Monotonic Stacks, and 5. Trie lookups. Start solving Blind 75 early!', 'Technical', 'interviews, coding, dsa', 1, 28, 3),
(2, 'Best Study Spots with High-Speed WiFi & Power Outlets on Campus', 'Ranking the top study zones: 1. Central Library 3rd Floor Silent Cubicles (Ethernet ports!), 2. Tech Building Glass Atrium (lots of natural light), 3. Innovation Center Cafeteria booths (great coffee). What\'s your favorite spot?', 'Campus', 'campus, study, library', 2, 35, 3),
(3, 'Guide: How to Contribute to Open Source Projects During Semester Breaks', 'Open source is the best way to get practical code review from senior engineers worldwide. Look for repositories with \'good-first-issue\' tags, read CONTRIBUTING.md, and test your changes locally before submitting a PR.', 'Academics', 'opensource, github, coding', 1, 42, 2),
(4, 'Preparation Strategy for Distributed Systems & Microservices Exam', 'Prof. Reed\'s notes in the Academic Resources tab are gold. Make sure you understand the difference between Raft leader election and log replication, and be ready to draw vector clock diagrams.', 'Academics', 'exams, distributed-systems', 10, 19, 2),
(5, 'University Hackathon 2026 Announced: Ideas, Mentor Hours & Team Formation', 'Registration is now officially open for Campus CodeSprint 2026! 24 hours of non-stop building, free meals, mentor sessions, and cash prizes for top solutions in smart campus and climate tech.', 'Events', 'hackathon, event, coding', 2, 56, 3),
(6, 'Top Cloud Certifications (AWS / GCP / Azure) Worth Pursuing as a Student', 'If you\'re looking to stand out in backend or DevOps recruitment, AWS Certified Cloud Practitioner and Solutions Architect Associate are the most recognized. University students get 50% discount vouchers through AWS Educate!', 'Career', 'cloud, aws, career', 9, 47, 2),
(7, 'Review of Elective Courses: Cloud Computing vs Machine Learning vs Cryptography', 'For anyone selecting semester 6 electives: Cloud Computing with Dr. Reed has great hands-on AWS lab assignments. Machine Learning is math-heavy but rewarding. Cryptography covers fascinating zero-knowledge proofs.', 'Academics', 'courses, electives', 6, 31, 2),
(8, 'Recommended Resources & GitHub Repos for Modern Full-Stack Development', 'Curated list for React 18, Spring Boot 3, and containerized microservices: check out \'roadmap.sh/full-stack\', official Spring documentation, and the Material UI component templates.', 'Technical', 'webdev, springboot, react', 1, 64, 2),
(9, 'Campus Shuttle Timings & Late Night Transportation Options', 'Reminder that the university night shuttle runs every 30 minutes between Central Library, Metro Station, and South Campus Hostels until 1:00 AM on weekdays.', 'General', 'transport, campus, safety', 8, 22, 1),
(10, 'Student Wellness & Mental Health Resources Available at University Health Center', 'Mid-semester exams can be stressful. Friendly reminder that the University Health Center offers free confidential counseling sessions, mindfulness workshops, and quiet meditation rooms every Tuesday and Thursday.', 'Campus', 'health, wellness, support', 9, 51, 2);

INSERT INTO `post_comments` (`id`, `post_id`, `author_id`, `content`) VALUES
(1, 1, 2, 'Awesome summary Aarav! The graph cycle detection question caught a lot of people off guard last week.'),
(2, 1, 10, 'Can confirm! Practice writing clean code on whiteboard too.'),
(3, 1, 9, 'Thanks for sharing, really helpful for the upcoming career fair.'),
(4, 2, 7, 'The Atrium is my go-to place between morning lectures!'),
(5, 2, 6, 'Don\'t forget the Mechanical workshop mezzanine, surprisingly peaceful after 4 PM.'),
(6, 2, 1, 'Central Library 3rd floor is unbeatable during finals week.'),
(7, 3, 10, 'Found my first open-source bug fix through Apache Commons last winter! Highly recommended.'),
(8, 3, 2, 'Also check out Google Summer of Code (GSoC) organizations.'),
(9, 4, 1, 'The solved question papers helped a lot with the Byzantine fault numericals.'),
(10, 4, 9, 'Good luck everyone on Thursday\'s exam!');

-- 14. Insert Initial Notifications (10 records)
INSERT INTO `notifications` (`id`, `recipient_id`, `title`, `message`, `type`, `reference_id`, `is_read`) VALUES
(1, 1, 'Welcome to CampusHub Platform!', 'Explore events, internships, academic resources, and team finder across your campus.', 'SYSTEM', 1, TRUE),
(2, 1, 'Event Approved: Campus CodeSprint 2026', 'Your hackathon event submission has been approved by university administration.', 'EVENT_REGISTRATION', 1, FALSE),
(3, 1, 'Registration Confirmed: Cybersecurity CTF', 'Your registration for Cybersecurity CTF & Ethical Hacking Lab has been confirmed.', 'EVENT_REGISTRATION', 3, FALSE),
(4, 1, 'New Internship: Software Engineering Intern', 'Nexus Cloud Technologies posted an internship matching your profile skills.', 'SYSTEM', 1, FALSE),
(5, 1, 'Ride Booking Confirmed', 'Priya Patel booked 1 seat on your ride to Central Train Terminal.', 'RIDE_BOOKED', 1, TRUE),
(6, 1, 'Team Join Request Received', 'Priya Patel requested to join your hackathon team \'CampusAI Solvers\'.', 'SYSTEM', 1, TRUE),
(7, 1, 'Marketplace Listing Inquiry', 'A buyer is interested in your \'Introduction to Algorithms\' textbook listing.', 'SYSTEM', 1, FALSE),
(8, 1, 'New Comment on Your Community Post', 'Priya Patel replied to \'Tips for Cracking Technical Coding Interviews\'.', 'SYSTEM', 1, FALSE),
(9, 1, 'Item Claim Resolved: Lost & Found', 'Your report for lost student ID card has an update from the security office.', 'SYSTEM', 4, FALSE),
(10, 1, 'Campus Library System Maintenance Alert', 'Campus portal network upgrades will occur Sunday midnight from 1:00 AM to 3:00 AM.', 'SYSTEM', 2, FALSE);

-- 15. Insert Initial Audit Logs (10 records)
INSERT INTO `audit_logs` (`id`, `action`, `actor_id`, `entity_type`, `entity_id`, `details`, `ip_address`) VALUES
(1, 'EVENT_APPROVED', 5, 'EVENT', 1, 'Approved Campus CodeSprint 2026: 24h Hackathon', '127.0.0.1'),
(2, 'EVENT_APPROVED', 5, 'EVENT', 2, 'Approved Workshop: Advanced Spring Boot & Microservices', '127.0.0.1'),
(3, 'EVENT_APPROVED', 5, 'EVENT', 3, 'Approved Cybersecurity CTF & Ethical Hacking Lab', '127.0.0.1'),
(4, 'RESOURCE_UPLOADED', 3, 'RESOURCE', 1, 'Uploaded CS601 Distributed Systems lecture notes', '127.0.0.1'),
(5, 'INTERNSHIP_CREATED', 3, 'INTERNSHIP', 1, 'Posted Software Engineering Intern - Cloud Platforms', '127.0.0.1'),
(6, 'RIDE_CREATED', 1, 'RIDE', 1, 'Created ride from Campus North Gate to Central Train Terminal', '127.0.0.1'),
(7, 'RIDE_BOOKED', 2, 'RIDE', 1, 'Booked 1 seat on ride #1', '127.0.0.1'),
(8, 'MARKETPLACE_ITEM_CREATED', 1, 'MARKETPLACE', 1, 'Listed Introduction to Algorithms textbook for sale', '127.0.0.1'),
(9, 'TEAM_CREATED', 1, 'TEAM', 1, 'Created team CampusAI Solvers for Hackathon', '127.0.0.1'),
(10, 'LOST_FOUND_REPORTED', 2, 'LOST_FOUND', 1, 'Reported found Sony headphones in central library', '127.0.0.1');

-- =======================================================================
-- End of Script
-- =======================================================================
