package com.webhookdebugger.repository;

import com.webhookdebugger.model.WebhookRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WebhookRequestRepository extends JpaRepository<WebhookRequest, UUID> {

    List<WebhookRequest> findAllBySessionIdOrderByReceivedAtDesc(UUID sessionId);

    void deleteAllBySessionId(UUID sessionId);

    long countBySessionId(UUID sessionId);
}
