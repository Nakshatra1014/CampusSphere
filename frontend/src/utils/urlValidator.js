/**
 * URL validation utilities for external internship listings.
 * Enforces strict HTTPS protocol, trusted Internshala domains, and safe URL structure.
 */

export const DEFAULT_INTERNSHALA_PORTAL = 'https://internshala.com/internships';

/**
 * Validates whether a candidate URL is a safe, trusted HTTPS Internshala URL.
 *
 * @param {string} url - Candidate URL string
 * @returns {boolean} True if the URL is valid, uses HTTPS, and points to an allowed Internshala domain.
 */
export function isValidInternshalaUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim();

  // Strict prefix check before URL parsing
  if (!trimmed.toLowerCase().startsWith('https://')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);

    // Scheme must be strictly https:
    if (parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Host must be internshala.com or a valid subdomain (*.internshala.com)
    const isAllowedHost = hostname === 'internshala.com' || hostname.endsWith('.internshala.com');
    if (!isAllowedHost) {
      return false;
    }

    // Port check: must be default (empty string in WHATWG URL) or 443
    if (parsed.port && parsed.port !== '443') {
      return false;
    }

    // Must not contain user credentials (e.g., https://user:pass@internshala.com)
    if (parsed.username || parsed.password) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Returns a validated HTTPS Internshala URL or the safe default portal URL.
 *
 * @param {string} url - Raw or candidate URL
 * @returns {string} Sanitized URL
 */
export function getSafeInternshalaUrl(url) {
  if (!url || typeof url !== 'string') {
    return DEFAULT_INTERNSHALA_PORTAL;
  }

  let candidate = url.trim();

  // Attempt upgrade if raw URL was given as http:// for an internshala domain
  if (candidate.toLowerCase().startsWith('http://internshala.com') ||
      candidate.toLowerCase().startsWith('http://') && candidate.toLowerCase().includes('.internshala.com')) {
    candidate = 'https://' + candidate.substring(7);
  } else if (!candidate.toLowerCase().startsWith('http://') && !candidate.toLowerCase().startsWith('https://')) {
    candidate = 'https://' + candidate;
  }

  if (isValidInternshalaUrl(candidate)) {
    return candidate;
  }

  return DEFAULT_INTERNSHALA_PORTAL;
}
