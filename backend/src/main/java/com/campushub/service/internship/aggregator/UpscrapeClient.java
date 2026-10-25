package com.campushub.service.internship.aggregator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Backend HTTP client for the third-party Upscrape API.
 * Communicates with Upscrape over REST using POST /execute.
 * Enforces secure credentials handling, strict timeouts, and robust error recovery.
 */
@Slf4j
@Component
public class UpscrapeClient {

    private final String apiKey;
    private final String baseUrl;
    private final int connectTimeout;
    private final int readTimeout;
    private final int waitSeconds;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private volatile String lastErrorMessage = null;

    public UpscrapeClient(
            @Value("${app.upscrape.api-key:}") String apiKey,
            @Value("${app.upscrape.base-url:https://data.upscrape.com}") String baseUrl,
            @Value("${app.upscrape.connect-timeout-ms:5000}") int connectTimeout,
            @Value("${app.upscrape.read-timeout-ms:35000}") int readTimeout,
            @Value("${app.upscrape.wait-seconds:30}") int waitSeconds,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl != null && !baseUrl.trim().isEmpty() ? baseUrl.trim() : "https://data.upscrape.com";
        this.connectTimeout = connectTimeout > 0 ? connectTimeout : 5000;
        this.readTimeout = readTimeout > 0 ? readTimeout : 35000;
        this.waitSeconds = waitSeconds > 0 ? waitSeconds : 30;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(this.connectTimeout);
        factory.setReadTimeout(this.readTimeout);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Checks if a valid API key has been configured.
     */
    public boolean isConfigured() {
        return !apiKey.isEmpty();
    }

    public String getLastErrorMessage() {
        return lastErrorMessage;
    }

    /**
     * Executes an Upscrape capability via POST /execute.
     *
     * @param capability The endpoint identifier (e.g. "internshala.internships.list")
     * @param input      Input parameters map for the capability
     * @return JsonNode of the response or null if execution failed or API key missing
     */
    public JsonNode executeCapability(String capability, Map<String, Object> input) {
        this.lastErrorMessage = null;
        if (!isConfigured()) {
            this.lastErrorMessage = "Upscrape API key is not configured. Please set UPSCRAPE_API_KEY environment variable.";
            log.warn("Upscrape API key is not configured (UPSCRAPE_API_KEY is unset or blank). Live API call to [{}] will be skipped.", capability);
            return null;
        }

        String url = baseUrl + (baseUrl.endsWith("/") ? "" : "/") + "execute";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Prefer", "wait=" + waitSeconds);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("capability", capability);
        requestBody.put("input", input != null ? input : Map.of());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Dispatching Upscrape execution request for capability [{}] with timeout [{}ms]...", capability, readTimeout);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Received successful response from Upscrape for capability [{}] (Status: {})", capability, response.getStatusCode());
                return objectMapper.readTree(response.getBody());
            } else {
                this.lastErrorMessage = "Upscrape returned non-2xx status " + response.getStatusCode() + " for capability [" + capability + "]";
                log.warn(this.lastErrorMessage);
                return null;
            }
        } catch (HttpClientErrorException.Unauthorized e) {
            this.lastErrorMessage = "Upscrape authentication failed: Invalid or expired API key (HTTP 401 Unauthorized).";
            log.error(this.lastErrorMessage);
            return null;
        } catch (HttpClientErrorException.TooManyRequests e) {
            this.lastErrorMessage = "Upscrape rate limit exceeded (HTTP 429 Too Many Requests). Please wait a few minutes before retrying.";
            log.error(this.lastErrorMessage);
            return null;
        } catch (HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            if (e.getStatusCode() == HttpStatus.PAYMENT_REQUIRED) {
                this.lastErrorMessage = "Upscrape credit balance exhausted or payment required (HTTP 402 Payment Required).";
            } else {
                this.lastErrorMessage = "Upscrape client error during capability [" + capability + "]: Status " + e.getStatusCode() + " - " + e.getStatusText() + (body != null && !body.trim().isEmpty() ? " -> " + body.trim() : "");
            }
            log.error(this.lastErrorMessage);
            return null;
        } catch (HttpServerErrorException e) {
            this.lastErrorMessage = "Upscrape server error during capability [" + capability + "]: Status " + e.getStatusCode() + " - " + e.getStatusText();
            log.error(this.lastErrorMessage);
            return null;
        } catch (ResourceAccessException e) {
            this.lastErrorMessage = "Upscrape request timed out or connection failed: " + e.getMessage();
            log.error(this.lastErrorMessage);
            return null;
        } catch (Exception e) {
            this.lastErrorMessage = "Unexpected error executing Upscrape capability [" + capability + "]: " + e.getMessage();
            log.error(this.lastErrorMessage);
            return null;
        }
    }
}
