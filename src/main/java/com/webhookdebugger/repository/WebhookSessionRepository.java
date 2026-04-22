package com.webhookdebugger.repository;

import com.webhookdebugger.model.WebhookSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WebhookSessionRepository extends JpaRepository<WebhookSession, UUID> {

    Optional<WebhookSession> findById(UUID id);
}
