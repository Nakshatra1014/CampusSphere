package com.campushub.service.internship.aggregator;

import com.campushub.dto.internship.SyncStatusResponse;
import com.campushub.entity.Internship;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.repository.InternshipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Service orchestrating external internship aggregation, deduplication,
 * and database persistence without disrupting manually posted records.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InternshipSyncService {

    private final List<InternshipProvider> providers;
    private final InternshipRepository internshipRepository;
    private final UpscrapeClient upscrapeClient;

    @Value("${app.internshala.sync.default-limit:15}")
    private int defaultLimit;

    @Value("${app.internshala.sync.default-keywords:computer science,software engineering}")
    private String defaultKeywords;

    private final AtomicBoolean isSyncInProgress = new AtomicBoolean(false);

    // Operational sync metrics state
    private volatile LocalDateTime lastSyncTime = null;
    private volatile String currentStatus = "IDLE"; // "IDLE", "SUCCESS", "FAILED", "RUNNING", "UNCONFIGURED_API_KEY", "SKIPPED_OR_EMPTY"
    private volatile String lastMessage = "No synchronization has occurred yet.";
    private volatile int lastTotalFetched = 0;
    private volatile int lastTotalImported = 0;
    private volatile int lastTotalUpdated = 0;
    private volatile int lastTotalSkipped = 0;
    private volatile long lastDurationMs = 0;

    /**
     * Executes synchronization across all active providers (or specifically Internshala).
     *
     * @param manual Whether this was triggered manually by an Admin.
     * @return Current SyncStatusResponse detailing the outcome.
     */
    public SyncStatusResponse syncAll(boolean manual) {
        if (!upscrapeClient.isConfigured()) {
            this.currentStatus = "UNCONFIGURED_API_KEY";
            this.lastMessage = "Upscrape API key is not configured. Please set the UPSCRAPE_API_KEY environment variable.";
            log.warn("Cannot synchronize Internshala listings: UPSCRAPE_API_KEY is not configured.");
            return getSyncStatus();
        }

        if (!isSyncInProgress.compareAndSet(false, true)) {
            log.warn("Synchronization is already actively running in another thread. Skipping duplicate trigger.");
            return getSyncStatus();
        }

        long startTime = System.currentTimeMillis();
        currentStatus = "RUNNING";
        lastMessage = "Synchronization in progress (" + (manual ? "Manual Trigger" : "Scheduled Job") + ")...";

        int totalFetched = 0;
        int totalImported = 0;
        int totalUpdated = 0;
        int totalSkipped = 0;

        try {
            InternshipSyncOptions options = InternshipSyncOptions.builder()
                    .limit(defaultLimit > 0 ? defaultLimit : 15)
                    .keywords(defaultKeywords)
                    .build();

            for (InternshipProvider provider : providers) {
                log.info("Starting internship synchronization from provider [{}]...", provider.getDisplayName());
                List<InternshipListingDto> listings = provider.fetchInternships(options);
                totalFetched += listings.size();

                for (InternshipListingDto dto : listings) {
                    try {
                        SyncAction action = persistOrUpdateListing(dto);
                        if (action == SyncAction.IMPORTED) {
                            totalImported++;
                        } else if (action == SyncAction.UPDATED) {
                            totalUpdated++;
                        } else {
                            totalSkipped++;
                        }
                    } catch (Exception e) {
                        log.error("Failed to persist listing [{}] from [{}]: {}", dto.getTitle(), provider.getDisplayName(), e.getMessage());
                        totalSkipped++;
                    }
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            this.lastDurationMs = duration;
            this.lastSyncTime = LocalDateTime.now();
            this.lastTotalFetched = totalFetched;
            this.lastTotalImported = totalImported;
            this.lastTotalUpdated = totalUpdated;
            this.lastTotalSkipped = totalSkipped;

            if (totalFetched == 0) {
                this.currentStatus = "SKIPPED_OR_EMPTY";
                this.lastMessage = "Synchronization completed: 0 listings returned (check API key or filter keywords).";
            } else {
                this.currentStatus = "SUCCESS";
                this.lastMessage = String.format("Successfully synchronized: %d fetched, %d imported, %d updated, %d skipped duplicates (%d ms).",
                        totalFetched, totalImported, totalUpdated, totalSkipped, duration);
            }

            log.info("Internship synchronization finished: {}", this.lastMessage);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            this.lastDurationMs = duration;
            this.currentStatus = "FAILED";
            this.lastMessage = "Synchronization failed: " + e.getMessage();
            log.error("Error during internship synchronization: ", e);
        } finally {
            isSyncInProgress.set(false);
        }

        return getSyncStatus();
    }

    /**
     * Deduplicates and saves or updates an aggregated listing.
     * Prevents overwriting or deleting manually created CampusSphere internships.
     */
    @Transactional
    public SyncAction persistOrUpdateListing(InternshipListingDto dto) {
        if (dto == null || dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            return SyncAction.SKIPPED;
        }

        String platform = dto.getSourcePlatform() != null ? dto.getSourcePlatform() : UpscrapeInternshalaProvider.PROVIDER_NAME;

        // 1. Primary Deduplication Strategy: by sourcePlatform + externalId
        Optional<Internship> existingOpt = Optional.empty();
        if (dto.getExternalId() != null && !dto.getExternalId().trim().isEmpty()) {
            existingOpt = internshipRepository.findBySourcePlatformAndExternalId(platform, dto.getExternalId().trim());
        }

        // 2. Secondary Deduplication Strategy: by canonical external URL
        if (existingOpt.isEmpty() && dto.getExternalUrl() != null && !dto.getExternalUrl().trim().isEmpty()) {
            existingOpt = internshipRepository.findBySourcePlatformAndExternalUrl(platform, dto.getExternalUrl().trim());
        }

        // 3. Fallback Deduplication Strategy: by application link
        if (existingOpt.isEmpty() && dto.getExternalUrl() != null && !dto.getExternalUrl().trim().isEmpty()) {
            existingOpt = internshipRepository.findBySourcePlatformAndApplicationLink(platform, dto.getExternalUrl().trim());
        }

        if (existingOpt.isPresent()) {
            Internship existing = existingOpt.get();
            // Verify this is an external listing to protect any manual records
            if (!existing.isExternal()) {
                log.warn("Matching internal manual internship found (ID: {}). Preserving manual record without modification.", existing.getId());
                return SyncAction.SKIPPED;
            }

            // Update metadata and timestamp
            existing.setLastSyncedAt(LocalDateTime.now());
            if (dto.getStipend() != null) existing.setStipend(dto.getStipend());
            if (dto.getApplicationDeadline() != null) existing.setApplicationDeadline(dto.getApplicationDeadline());
            internshipRepository.save(existing);
            return SyncAction.UPDATED;
        }

        // 4. Create new external internship record
        Internship newRecord = Internship.builder()
                .title(dto.getTitle().length() > 150 ? dto.getTitle().substring(0, 147) + "..." : dto.getTitle())
                .companyName(dto.getCompanyName().length() > 100 ? dto.getCompanyName().substring(0, 97) + "..." : dto.getCompanyName())
                .description(dto.getDescription())
                .location(dto.getLocation().length() > 100 ? dto.getLocation().substring(0, 97) + "..." : dto.getLocation())
                .workMode(dto.getWorkMode() != null ? dto.getWorkMode() : Internship.WorkMode.ON_SITE)
                .stipend(dto.getStipend())
                .duration(dto.getDuration())
                .eligibility(dto.getEligibility())
                .skillsRequired(dto.getSkillsRequired())
                .applicationDeadline(dto.getApplicationDeadline())
                .applicationLink(dto.getExternalUrl())
                .externalUrl(dto.getExternalUrl())
                .externalId(dto.getExternalId())
                .sourcePlatform(platform)
                .isExternal(true)
                .lastSyncedAt(LocalDateTime.now())
                .status(InternshipStatus.ACTIVE)
                .build();

        internshipRepository.save(newRecord);
        return SyncAction.IMPORTED;
    }

    /**
     * Returns current operational synchronization metrics.
     */
    public SyncStatusResponse getSyncStatus() {
        boolean apiKeyConfigured = upscrapeClient.isConfigured();
        String status = currentStatus;
        String message = lastMessage;

        if (!apiKeyConfigured && "IDLE".equals(status)) {
            status = "UNCONFIGURED_API_KEY";
            message = "Upscrape API key is not configured. Please set the UPSCRAPE_API_KEY environment variable to enable live Internshala aggregation.";
        }

        return SyncStatusResponse.builder()
                .status(status)
                .message(message)
                .lastSyncTime(lastSyncTime)
                .totalFetched(lastTotalFetched)
                .totalImported(lastTotalImported)
                .totalUpdated(lastTotalUpdated)
                .totalSkipped(lastTotalSkipped)
                .lastDurationMs(lastDurationMs)
                .isSyncRunning(isSyncInProgress.get())
                .isApiKeyConfigured(apiKeyConfigured)
                .configuredProvider(providers.isEmpty() ? "None" : providers.get(0).getDisplayName())
                .build();
    }

    public enum SyncAction {
        IMPORTED,
        UPDATED,
        SKIPPED
    }
}
