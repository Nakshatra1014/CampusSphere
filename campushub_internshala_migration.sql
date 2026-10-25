-- =======================================================================
-- CampusSphere - Internshala Internship Aggregation Migration Script
-- =======================================================================
-- Safe, non-destructive migration script for MySQL to support external
-- internship aggregation from Internshala via the Upscrape API.
-- =======================================================================

USE `campushub`;

-- 1. Allow posted_by_id to be nullable for externally aggregated listings
ALTER TABLE `internships` MODIFY COLUMN `posted_by_id` BIGINT NULL;

-- 2. Allow application_deadline to be nullable if an external listing does not publish a deadline
ALTER TABLE `internships` MODIFY COLUMN `application_deadline` DATE NULL;

-- 3. Add external source and deduplication columns
ALTER TABLE `internships` ADD COLUMN `source_platform` VARCHAR(50) NOT NULL DEFAULT 'CAMPUSSPHERE';
ALTER TABLE `internships` ADD COLUMN `is_external` BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE `internships` ADD COLUMN `external_id` VARCHAR(255) NULL;
ALTER TABLE `internships` ADD COLUMN `external_url` VARCHAR(1000) NULL;
ALTER TABLE `internships` ADD COLUMN `last_synced_at` DATETIME NULL;

-- 4. Create indexes for fast deduplication and source filtering
CREATE INDEX `idx_internships_source_ext_id` ON `internships` (`source_platform`, `external_id`);
CREATE INDEX `idx_internships_source_ext_url` ON `internships` (`source_platform`, `external_url`(255));
CREATE INDEX `idx_internships_source_platform` ON `internships` (`source_platform`);
CREATE INDEX `idx_internships_is_external` ON `internships` (`is_external`);

-- 5. Add is_self_reported column to internship_applications table for tracking external applications
ALTER TABLE `internship_applications` ADD COLUMN `is_self_reported` BOOLEAN NOT NULL DEFAULT FALSE;

