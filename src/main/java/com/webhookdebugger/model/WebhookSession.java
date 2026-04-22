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
@Table(name = "webhook_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookSession {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column
    private String label;

    @Column(nullable = false)
    @Builder.Default
    private Integer customResponseStatus = 200;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String customResponseBody = "";

    @PrePersist
    protected void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (expiresAt == null) {
            expiresAt = createdAt.plusHours(24);
        }
        if (customResponseStatus == null) {
            customResponseStatus = 200;
        }
        if (customResponseBody == null) {
            customResponseBody = "";
        }
    }
}
