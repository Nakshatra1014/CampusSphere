
package com.campushub.service.internship.aggregator;

import com.campushub.entity.Internship.WorkMode;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpscrapeInternshalaProvider implements InternshipProvider {

    public static final String PROVIDER_NAME = "INTERNSHALA";
    public static final String DISPLAY_NAME = "Internshala";
    private static final String CAPABILITY = "internshala.internships.list";

    private final UpscrapeClient upscrapeClient;

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public String getDisplayName() {
        return DISPLAY_NAME;
    }

    @Override
    public List<InternshipListingDto> fetchInternships(
            InternshipSyncOptions options) {

        if (!upscrapeClient.isConfigured()) {
            log.info("Upscrape API key is not configured. "
                    + "Skipping Internshala provider fetch.");
            return Collections.emptyList();
        }

        Map<String, Object> input = buildInputPayload(options);

        JsonNode responseNode =
                upscrapeClient.executeCapability(CAPABILITY, input);

        if (responseNode == null) {
            String errorMsg = upscrapeClient.getLastErrorMessage();

            if (errorMsg != null && !errorMsg.isEmpty()) {
                log.error(
                        "Upscrape request failed for capability [{}]: {}",
                        CAPABILITY,
                        errorMsg
                );
                throw new IllegalStateException(errorMsg);
            }

            log.warn(
                    "Null response returned from Upscrape client "
                            + "for capability [{}].",
                    CAPABILITY
            );
            return Collections.emptyList();
        }

        return parseInternshipsList(responseNode);
    }

    /**
     * Builds the input payload expected by Upscrape.
     * The keywords parameter must be a single string, not a list.
     */
    public Map<String, Object> buildInputPayload(
            InternshipSyncOptions options) {

        Map<String, Object> input = new HashMap<>();

        if (options == null) {
            return input;
        }

        // Upscrape expects one keyword string per request.
        if (options.getKeywords() != null
                && !options.getKeywords().trim().isEmpty()) {

            String keyword = Arrays.stream(
                            options.getKeywords().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .findFirst()
                    .orElse("");

            if (!keyword.isEmpty()) {
                input.put("keywords", keyword);
            }
        }

        // Do not combine keyword and location filters.
        if (!input.containsKey("keywords")) {
            if (options.getLocation() != null
                    && !options.getLocation().trim().isEmpty()) {

                input.put("location", options.getLocation().trim());

            } else if (Boolean.TRUE.equals(options.getRemoteOnly())) {
                input.put("location", "Remote");
            }
        }

        int maxResults = options.getLimit() > 0
                ? options.getLimit()
                : 15;

        input.put("max_results", maxResults);
        input.put("max_pages", 1);
        input.put("page", 1);

        return input;
    }

    public boolean isConfigured() {
        return upscrapeClient != null
                && upscrapeClient.isConfigured();
    }

    /**
     * Parses the Upscrape response into normalized internship records.
     */
    public List<InternshipListingDto> parseInternshipsList(
            JsonNode rootNode) {

        List<InternshipListingDto> listings = new ArrayList<>();

        if (rootNode == null || rootNode.isNull()) {
            return listings;
        }

        List<JsonNode> recordNodes = extractRecordNodes(rootNode);

        if (recordNodes.isEmpty()) {
            log.info(
                    "No internship records found in Upscrape "
                            + "Internshala response payload."
            );
            return listings;
        }

        for (JsonNode itemNode : recordNodes) {
            try {
                InternshipListingDto dto = mapSingleItem(itemNode);

                if (dto != null
                        && dto.getTitle() != null
                        && !dto.getTitle().trim().isEmpty()) {
                    listings.add(dto);
                }

            } catch (Exception e) {
                log.warn(
                        "Failed to parse individual Internshala item: {}",
                        e.getMessage()
                );
            }
        }

        log.info(
                "Successfully parsed {} Internshala listings from Upscrape.",
                listings.size()
        );

        return listings;
    }

    /**
     * Supports multiple possible response structures:
     * results[0].data.records, result.items, root records,
     * internships, and root-level arrays.
     */
    public List<JsonNode> extractRecordNodes(JsonNode rootNode) {

        List<JsonNode> recordNodes = new ArrayList<>();

        if (rootNode == null || rootNode.isNull()) {
            return recordNodes;
        }

        // 1. Root array.
        if (rootNode.isArray()) {
            for (JsonNode elem : rootNode) {
                if (isListingObject(elem)) {
                    recordNodes.add(elem);

                } else if (elem.has("data")
                        && elem.get("data").has("records")) {

                    collectFromRecords(
                            elem.get("data").get("records"),
                            recordNodes
                    );
                }
            }

            if (!recordNodes.isEmpty()) {
                return recordNodes;
            }
        }

        // 2. Standard Upscrape results structure.
        if (rootNode.has("results")) {
            JsonNode resultsNode = rootNode.get("results");

            if (resultsNode.isArray()) {
                for (JsonNode resItem : resultsNode) {

                    if (resItem.has("data")
                            && resItem.get("data").has("records")) {

                        collectFromRecords(
                                resItem.get("data").get("records"),
                                recordNodes
                        );

                    } else if (resItem.has("records")) {

                        collectFromRecords(
                                resItem.get("records"),
                                recordNodes
                        );

                    } else if (isListingObject(resItem)) {
                        recordNodes.add(resItem);
                    }
                }

                if (!recordNodes.isEmpty()) {
                    return recordNodes;
                }
            }
        }

        // 3. Responses wrapped inside "result".
        if (rootNode.has("result")) {
            JsonNode resultNode = rootNode.get("result");

            if (resultNode.isArray()) {
                for (JsonNode resItem : resultNode) {

                    if (resItem.has("data")
                            && resItem.get("data").has("records")) {

                        collectFromRecords(
                                resItem.get("data").get("records"),
                                recordNodes
                        );

                    } else if (resItem.has("records")) {

                        collectFromRecords(
                                resItem.get("records"),
                                recordNodes
                        );

                    } else if (isListingObject(resItem)) {
                        recordNodes.add(resItem);
                    }
                }

            } else if (resultNode.isObject()) {

                if (resultNode.has("results")
                        && resultNode.get("results").isArray()) {

                    for (JsonNode resItem
                            : resultNode.get("results")) {

                        if (resItem.has("data")
                                && resItem.get("data").has("records")) {

                            collectFromRecords(
                                    resItem.get("data").get("records"),
                                    recordNodes
                            );

                        } else if (isListingObject(resItem)) {
                            recordNodes.add(resItem);
                        }
                    }
                }

                if (resultNode.has("data")
                        && resultNode.get("data").has("records")) {

                    collectFromRecords(
                            resultNode.get("data").get("records"),
                            recordNodes
                    );

                } else if (resultNode.has("records")) {

                    collectFromRecords(
                            resultNode.get("records"),
                            recordNodes
                    );

                } else if (resultNode.has("items")) {

                    collectFromRecords(
                            resultNode.get("items"),
                            recordNodes
                    );

                } else if (resultNode.has("internships")) {

                    collectFromRecords(
                            resultNode.get("internships"),
                            recordNodes
                    );
                }
            }

            if (!recordNodes.isEmpty()) {
                return recordNodes;
            }
        }

        // 4. Other root-level response variations.
        if (rootNode.has("data")) {
            JsonNode dataNode = rootNode.get("data");

            if (dataNode.has("records")) {
                collectFromRecords(
                        dataNode.get("records"),
                        recordNodes
                );

            } else if (dataNode.isArray()) {
                collectFromRecords(dataNode, recordNodes);
            }
        }

        if (recordNodes.isEmpty() && rootNode.has("records")) {
            collectFromRecords(rootNode.get("records"), recordNodes);
        }

        if (recordNodes.isEmpty() && rootNode.has("items")) {
            collectFromRecords(rootNode.get("items"), recordNodes);
        }

        if (recordNodes.isEmpty() && rootNode.has("internships")) {
            collectFromRecords(
                    rootNode.get("internships"),
                    recordNodes
            );
        }

        return recordNodes;
    }

    private void collectFromRecords(
            JsonNode recordsNode,
            List<JsonNode> targetList) {

        if (recordsNode != null && recordsNode.isArray()) {
            for (JsonNode record : recordsNode) {
                if (record != null && record.isObject()) {
                    targetList.add(record);
                }
            }
        }
    }

    private boolean isListingObject(JsonNode node) {
        if (node == null || !node.isObject()) {
            return false;
        }

        return node.has("title")
                || node.has("role")
                || node.has("position")
                || node.has("url");
    }

    private InternshipListingDto mapSingleItem(JsonNode node) {

        String title = getFirstNonEmptyText(
                node, "title", "role", "position"
        );

        if (title == null || title.trim().isEmpty()) {
            return null;
        }

        String companyName = getFirstNonEmptyText(
                node,
                "company",
                "company_name",
                "companyName",
                "employer"
        );

        if (companyName == null || companyName.trim().isEmpty()) {
            companyName = "Internshala Verified Organization";
        }

        String companyUrl = getFirstNonEmptyText(
                node, "company_url", "companyUrl", "website"
        );

        String location = getFirstNonEmptyText(
                node, "location", "city", "place"
        );

        if (location == null || location.trim().isEmpty()) {
            location = "India (Remote / Flexible)";
        }

        // Determine work mode.
        WorkMode workMode = WorkMode.ON_SITE;

        boolean isRemote =
                node.path("work_from_home").asBoolean(false)
                || node.path("is_remote").asBoolean(false)
                || location.toLowerCase().contains("work from home")
                || location.toLowerCase().contains("remote");

        boolean isHybrid =
                location.toLowerCase().contains("hybrid");

        if (isRemote) {
            workMode = WorkMode.REMOTE;
        } else if (isHybrid) {
            workMode = WorkMode.HYBRID;
        }

        // Determine stipend.
        String stipend = getFirstNonEmptyText(
                node, "stipend", "salary"
        );

        if (stipend == null || stipend.trim().isEmpty()) {

            long min = node.path("salary_min").asLong(0);
            long max = node.path("salary_max").asLong(0);

            String currency = getFirstNonEmptyText(
                    node, "salary_currency", "currency"
            );

            if (currency == null || currency.trim().isEmpty()) {
                currency = "₹";
            }

            if (min > 0 && max > 0 && min != max) {
                stipend = currency + " " + min
                        + " - " + currency + " " + max
                        + " /month";

            } else if (min > 0) {
                stipend = currency + " " + min + " /month";

            } else if (max > 0) {
                stipend = currency + " " + max + " /month";

            } else {
                stipend = "Unspecified / Performance-based";
            }
        }

        String duration = getFirstNonEmptyText(
                node, "duration", "period"
        );

        if (duration == null || duration.trim().isEmpty()) {
            duration = "Flexible Duration";
        }

        // Extract skills.
        String skillsRequired = null;

        if (node.has("skills")) {
            JsonNode skillsNode = node.get("skills");

            if (skillsNode.isArray()) {
                List<String> skillList = new ArrayList<>();

                for (JsonNode skill : skillsNode) {
                    if (skill.isTextual()
                            && !skill.asText().trim().isEmpty()) {
                        skillList.add(skill.asText().trim());
                    }
                }

                if (!skillList.isEmpty()) {
                    skillsRequired = String.join(", ", skillList);
                }

            } else if (skillsNode.isTextual()) {
                skillsRequired = skillsNode.asText().trim();
            }
        }

        if (skillsRequired == null) {
            skillsRequired = getFirstNonEmptyText(
                    node,
                    "skills_required",
                    "skillsRequired",
                    "tags"
            );
        }

        // Extract application deadline.
        LocalDate applicationDeadline = null;

        String deadlineStr = getFirstNonEmptyText(
                node,
                "valid_through",
                "deadline",
                "closing_date",
                "apply_by"
        );

        if (deadlineStr != null && !deadlineStr.trim().isEmpty()) {
            try {
                applicationDeadline = LocalDate.parse(
                        deadlineStr.substring(
                                0,
                                Math.min(10, deadlineStr.length())
                        )
                );

            } catch (DateTimeParseException e) {
                log.debug(
                        "Could not parse deadline date [{}]: {}",
                        deadlineStr,
                        e.getMessage()
                );
            }
        }

        // Use a fallback deadline when the source does not provide one.
        if (applicationDeadline == null) {
            applicationDeadline = LocalDate.now().plusDays(30);
        }

        // Remove HTML markup from external descriptions.
        String rawDescription = getFirstNonEmptyText(
                node,
                "description",
                "details",
                "summary",
                "about"
        );

        String cleanDescription;

        if (rawDescription != null
                && !rawDescription.trim().isEmpty()) {

            cleanDescription = sanitizeHtml(rawDescription);

        } else {
            cleanDescription = "Internship opportunity at "
                    + companyName + " in " + location
                    + ". For complete role requirements, prerequisites, "
                    + "and direct application submission, visit the "
                    + "official Internshala listing.";
        }

        // Extract and normalize the original listing URL.
        String rawExternalUrl = getFirstNonEmptyText(
                node,
                "url",
                "link",
                "internship_url",
                "source_url"
        );

        if (rawExternalUrl != null) {
            rawExternalUrl = rawExternalUrl.trim();

            if (rawExternalUrl.startsWith("/")) {
                rawExternalUrl =
                        "https://internshala.com" + rawExternalUrl;

            } else if (!rawExternalUrl.startsWith("http://")
                    && !rawExternalUrl.startsWith("https://")) {

                rawExternalUrl = "https://" + rawExternalUrl;
            }
        }

        String externalUrl =
                InternshalaUrlValidator.sanitizeOrFallback(
                        rawExternalUrl
                );

        // Create a stable external ID if none is supplied.
        String externalId = getFirstNonEmptyText(
                node, "id", "external_id", "listing_id"
        );

        if (externalId == null || externalId.trim().isEmpty()) {
            externalId = extractStableIdFromUrl(
                    externalUrl,
                    companyName,
                    title
            );
        }

        return InternshipListingDto.builder()
                .externalId(externalId)
                .title(title.trim())
                .companyName(companyName.trim())
                .companyUrl(companyUrl)
                .description(cleanDescription)
                .location(location.trim())
                .workMode(workMode)
                .stipend(stipend.trim())
                .duration(duration.trim())
                .skillsRequired(skillsRequired)
                .applicationDeadline(applicationDeadline)
                .externalUrl(externalUrl)
                .sourcePlatform(PROVIDER_NAME)
                .build();
    }

    private String getFirstNonEmptyText(
            JsonNode node,
            String... fieldNames) {

        for (String field : fieldNames) {
            if (node.has(field) && !node.get(field).isNull()) {

                String value = node.get(field).asText();

                if (value != null && !value.trim().isEmpty()) {
                    return value.trim();
                }
            }
        }

        return null;
    }

    /**
     * Removes HTML tags and decodes common HTML entities.
     */
    private String sanitizeHtml(String text) {
        if (text == null) {
            return "";
        }

        return text.replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Generates a deterministic ID when the listing has no ID.
     */
    private String extractStableIdFromUrl(
            String url,
            String company,
            String title) {

        if (url != null && url.contains("/internship/detail/")) {

            String path = url.substring(
                    url.indexOf("/internship/detail/")
                            + "/internship/detail/".length()
            );

            int queryIndex = path.indexOf('?');

            if (queryIndex != -1) {
                path = path.substring(0, queryIndex);
            }

            int slashIndex = path.indexOf('/');

            if (slashIndex != -1) {
                path = path.substring(0, slashIndex);
            }

            if (!path.isEmpty()) {
                return "internshala-" + path;
            }
        }

        String base = (company + "-" + title)
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-");

        return "internshala-"
                + (base.length() > 50
                ? base.substring(0, 50)
                : base);
    }
}
