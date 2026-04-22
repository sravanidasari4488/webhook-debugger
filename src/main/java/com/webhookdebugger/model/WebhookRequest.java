package com.webhookdebugger.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "webhook_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookRequest {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(nullable = false)
    private String method;

    @Column(columnDefinition = "TEXT")
    private String headers;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(columnDefinition = "TEXT")
    private String queryParams;

    @Column
    private String sourceIp;

    @Column(nullable = false, updatable = false)
    private LocalDateTime receivedAt;

    @Column(nullable = false)
    @Builder.Default
    private Integer customResponseStatus = 200;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String customResponseBody = "";

    @PrePersist
    protected void prePersist() {
        if (receivedAt == null) {
            receivedAt = LocalDateTime.now();
        }
        if (customResponseStatus == null) {
            customResponseStatus = 200;
        }
        if (customResponseBody == null) {
            customResponseBody = "";
        }
    }
}
