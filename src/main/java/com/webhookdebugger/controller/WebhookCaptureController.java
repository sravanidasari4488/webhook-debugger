package com.webhookdebugger.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webhookdebugger.exception.SessionNotFoundException;
import com.webhookdebugger.model.WebhookRequest;
import com.webhookdebugger.model.WebhookSession;
import com.webhookdebugger.repository.WebhookRequestRepository;
import com.webhookdebugger.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class WebhookCaptureController {

    private final SessionService sessionService;
    private final WebhookRequestRepository webhookRequestRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public WebhookCaptureController(
            SessionService sessionService,
            WebhookRequestRepository webhookRequestRepository,
            SimpMessagingTemplate simpMessagingTemplate,
            ObjectMapper objectMapper
    ) {
        this.sessionService = sessionService;
        this.webhookRequestRepository = webhookRequestRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.objectMapper = objectMapper;
    }

    @RequestMapping("/hook/{sessionId}")
    public ResponseEntity<String> captureWebhook(
            @PathVariable UUID sessionId,
            HttpServletRequest request,
            @RequestBody(required = false) String requestBody
    ) {
        WebhookSession session;
        try {
            session = sessionService.getSession(sessionId);
        } catch (SessionNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Session not found or expired");
        }

        if (sessionService.isSessionExpired(session)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Session not found or expired");
        }

        String rawBody = requestBody;
        if (rawBody == null) {
            rawBody = readBodySafely(request);
        }

        Map<String, List<String>> headers = extractHeaders(request);
        Map<String, String[]> queryParams = request.getParameterMap();

        String headersJson;
        String queryParamsJson;
        try {
            headersJson = objectMapper.writeValueAsString(headers);
            queryParamsJson = objectMapper.writeValueAsString(queryParams);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process webhook payload");
        }

        WebhookRequest webhookRequest = WebhookRequest.builder()
                .sessionId(sessionId)
                .method(request.getMethod())
                .headers(headersJson)
                .body(rawBody == null ? "" : rawBody)
                .queryParams(queryParamsJson)
                .sourceIp(request.getRemoteAddr())
                .receivedAt(LocalDateTime.now())
                .build();

        WebhookRequest savedRequest = webhookRequestRepository.save(webhookRequest);

        simpMessagingTemplate.convertAndSend("/topic/requests/" + sessionId, savedRequest);

        return ResponseEntity.status(session.getCustomResponseStatus())
                .body(session.getCustomResponseBody());
    }

    @RequestMapping(value = "/hook/{sessionId}", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handlePreflight(@PathVariable UUID sessionId) {
        return ResponseEntity.ok().build();
    }

    private Map<String, List<String>> extractHeaders(HttpServletRequest request) {
        Map<String, List<String>> headers = new LinkedHashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames != null && headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            List<String> values = new ArrayList<>();
            Enumeration<String> headerValues = request.getHeaders(headerName);
            while (headerValues.hasMoreElements()) {
                values.add(headerValues.nextElement());
            }
            headers.put(headerName, values);
        }
        return headers;
    }

    private String readBodySafely(HttpServletRequest request) {
        try {
            return StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            return "";
        }
    }
}
