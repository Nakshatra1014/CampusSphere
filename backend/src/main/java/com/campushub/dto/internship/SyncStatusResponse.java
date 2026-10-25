package com.campushub.dto.internship;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncStatusResponse {
    private String status;           // "IDLE", "SUCCESS", "FAILED", "RUNNING", "SKIPPED_NO_API_KEY"
    private String message;
    private LocalDateTime lastSyncTime;
    private int totalFetched;
    private int totalImported;
    private int totalUpdated;
    private int totalSkipped;
    private long lastDurationMs;
    private boolean isSyncRunning;
    private boolean isApiKeyConfigured;
    private String configuredProvider;
}
