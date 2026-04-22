package com.webhookdebugger.service;

import com.webhookdebugger.exception.SessionNotFoundException;
import com.webhookdebugger.model.WebhookRequest;
import com.webhookdebugger.model.WebhookSession;
import com.webhookdebugger.repository.WebhookRequestRepository;
import com.webhookdebugger.repository.WebhookSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final WebhookSessionRepository webhookSessionRepository;
    private final WebhookRequestRepository webhookRequestRepository;

    public WebhookSession createSession(String label) {
        LocalDateTime now = LocalDateTime.now();
        WebhookSession session = WebhookSession.builder()
                .label(label)
                .createdAt(now)
                .expiresAt(now.plusHours(24))
                .build();
        return webhookSessionRepository.save(session);
    }

    public WebhookSession getSession(UUID sessionId) {
        return webhookSessionRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));
    }

    public boolean isSessionExpired(WebhookSession session) {
        return LocalDateTime.now().isAfter(session.getExpiresAt());
    }

    public List<WebhookRequest> getAllRequestsForSession(UUID sessionId) {
        return webhookRequestRepository.findAllBySessionIdOrderByReceivedAtDesc(sessionId);
    }

    public void clearRequestsForSession(UUID sessionId) {
        webhookRequestRepository.deleteAllBySessionId(sessionId);
    }

    public WebhookSession updateMockResponse(UUID sessionId, Integer statusCode, String responseBody) {
        WebhookSession session = getSession(sessionId);
        session.setCustomResponseStatus(statusCode);
        session.setCustomResponseBody(responseBody == null ? "" : responseBody);
        return webhookSessionRepository.save(session);
    }
}
