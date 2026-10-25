package com.campushub.service.internship.aggregator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task that triggers daily synchronization of external internship listings.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InternshipSyncScheduler {

    private final InternshipSyncService syncService;

    @Value("${app.internshala.sync.enabled:true}")
    private boolean syncEnabled;

    /**
     * Executes automatic synchronization on the configured cron schedule.
     * Default: 2:00 AM daily (Asia/Kolkata timezone).
     */
    @Scheduled(cron = "${app.internshala.sync.cron:0 0 2 * * ?}")
    public void runScheduledSync() {
        if (!syncEnabled) {
            log.info("Scheduled Internshala internship synchronization is disabled in configuration (app.internshala.sync.enabled=false).");
            return;
        }

        log.info("Triggering scheduled daily Internshala internship synchronization job...");
        syncService.syncAll(false);
    }
}
