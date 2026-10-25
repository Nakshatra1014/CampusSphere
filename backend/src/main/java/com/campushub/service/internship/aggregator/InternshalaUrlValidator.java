package com.campushub.service.internship.aggregator;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

/**
 * Validates external URLs for Internshala listings.
 * Enforces strict HTTPS protocol, trusted Internshala domains, and safe URL structure.
 */
public final class InternshalaUrlValidator {

    private static final String DEFAULT_INTERNSHALA_PORTAL = "https://internshala.com/internships";

    private InternshalaUrlValidator() {}

    /**
     * Validates whether the given string is a safe, trusted HTTPS Internshala URL.
     *
     * @param url the candidate URL string
     * @return true if valid and trusted, false otherwise
     */
    public static boolean isValidInternshalaUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        String trimmed = url.trim();

        // Enforce strict HTTPS prefix before URI parsing
        if (!trimmed.toLowerCase(Locale.ROOT).startsWith("https://")) {
            return false;
        }

        try {
            URI uri = new URI(trimmed);

            // Scheme must be strictly https
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                return false;
            }

            String host = uri.getHost();
            if (host == null || host.trim().isEmpty()) {
                return false;
            }

            host = host.toLowerCase(Locale.ROOT);

            // Host must be internshala.com or a valid subdomain (*.internshala.com)
            boolean isAllowedHost = host.equals("internshala.com") || host.endsWith(".internshala.com");
            if (!isAllowedHost) {
                return false;
            }

            // Port check: must be default (-1) or standard HTTPS (443)
            if (uri.getPort() != -1 && uri.getPort() != 443) {
                return false;
            }

            // Must not contain user credentials (e.g., https://user:pass@internshala.com)
            if (uri.getUserInfo() != null) {
                return false;
            }

            return true;
        } catch (URISyntaxException e) {
            return false;
        }
    }

    /**
     * Returns the validated URL or falls back to the canonical Internshala portal.
     * If the URL uses http for an internshala.com host, attempts to upgrade to https.
     */
    public static String sanitizeOrFallback(String url) {
        if (url != null) {
            String trimmed = url.trim();
            if (trimmed.toLowerCase(Locale.ROOT).startsWith("http://internshala.com") ||
                    trimmed.toLowerCase(Locale.ROOT).matches("^http://[a-zA-Z0-9.-]+\\.internshala\\.com.*")) {
                trimmed = "https://" + trimmed.substring(7);
            }
            if (isValidInternshalaUrl(trimmed)) {
                return trimmed;
            }
        }
        return DEFAULT_INTERNSHALA_PORTAL;
    }
}
