package com.webhookdebugger.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webhookdebugger.model.WebhookRequest;
import com.webhookdebugger.model.WebhookSession;
import com.webhookdebugger.repository.WebhookRequestRepository;
import com.webhookdebugger.service.SessionService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final WebhookRequestRepository webhookRequestRepository;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<WebhookSession> createSession(@RequestBody(required = false) CreateSessionRequest request) {
        String label = request != null ? request.getLabel() : null;
        WebhookSession created = sessionService.createSession(label);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{sessionId}")
    public SessionDetailsResponse getSession(@PathVariable UUID sessionId) {
        WebhookSession session = sessionService.getSession(sessionId);
        boolean expired = sessionService.isSessionExpired(session);
        return new SessionDetailsResponse(session, expired);
    }

    @GetMapping("/{sessionId}/requests")
    public List<WebhookRequest> getRequestsForSession(@PathVariable UUID sessionId) {
        sessionService.getSession(sessionId);
        return sessionService.getAllRequestsForSession(sessionId);
    }

    @DeleteMapping("/{sessionId}/requests")
    public Map<String, String> clearRequestsForSession(@PathVariable UUID sessionId) {
        sessionService.getSession(sessionId);
        sessionService.clearRequestsForSession(sessionId);
        return Map.of("message", "Cleared");
    }

    @PutMapping("/{sessionId}/mock-response")
    public WebhookSession updateMockResponse(
            @PathVariable UUID sessionId,
            @RequestBody UpdateMockResponseRequest request
    ) {
        return sessionService.updateMockResponse(
                sessionId,
                request.getStatusCode(),
                request.getResponseBody()
        );
    }

    @PostMapping("/{sessionId}/requests/{requestId}/replay")
    public ResponseEntity<?> replayRequest(
            @PathVariable UUID sessionId,
            @PathVariable UUID requestId,
            @RequestBody ReplayRequest replayRequest
    ) {
        Optional<WebhookRequest> optionalRequest = webhookRequestRepository.findById(requestId);
        if (optionalRequest.isEmpty() || !sessionId.equals(optionalRequest.get().getSessionId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(errorResponse("Webhook request not found"));
        }

        WebhookRequest storedRequest = optionalRequest.get();

        try {
            Map<String, Object> headers = objectMapper.readValue(
                    storedRequest.getHeaders() == null ? "{}" : storedRequest.getHeaders(),
                    new TypeReference<>() {}
            );

            HttpClient httpClient = HttpClient.newHttpClient();
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(replayRequest.getTargetUrl()));
            List<String> restrictedHeaders = List.of(
                    "connection",
                    "host",
                    "content-length",
                    "transfer-encoding",
                    "upgrade"
            );

            for (Map.Entry<String, Object> entry : headers.entrySet()) {
                String headerName = entry.getKey();
                if (restrictedHeaders.contains(headerName.toLowerCase())) {
                    continue;
                }
                for (String value : toHeaderValues(entry.getValue())) {
                    requestBuilder.header(headerName, value);
                }
            }

            String body = storedRequest.getBody() == null ? "" : storedRequest.getBody();
            requestBuilder.method(
                    storedRequest.getMethod(),
                    HttpRequest.BodyPublishers.ofString(body)
            );

            HttpResponse<String> replayResponse = httpClient.send(
                    requestBuilder.build(),
                    HttpResponse.BodyHandlers.ofString()
            );

            return ResponseEntity.ok(
                    new ReplayResponse(replayResponse.statusCode(), replayResponse.body())
            );
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse("Replay failed: " + ex.getMessage()));
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSessionRequest {
        private String label;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateMockResponseRequest {
        private Integer statusCode;
        private String responseBody;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionDetailsResponse {
        private WebhookSession session;
        private boolean expired;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplayRequest {
        private String targetUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplayResponse {
        private int statusCode;
        private String responseBody;
    }

    private List<String> toHeaderValues(Object value) {
        if (value == null) {
            return Collections.emptyList();
        }
        if (value instanceof String stringValue) {
            return List.of(stringValue);
        }
        if (value instanceof Collection<?> collection) {
            List<String> values = new ArrayList<>();
            for (Object item : collection) {
                if (item != null) {
                    values.add(String.valueOf(item));
                }
            }
            return values;
        }
        return List.of(String.valueOf(value));
    }

    private Map<String, Object> errorResponse(String message) {
        return Map.of(
                "message", message,
                "timestamp", LocalDateTime.now()
        );
    }
}
