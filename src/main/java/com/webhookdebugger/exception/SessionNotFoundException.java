package com.webhookdebugger.exception;

import java.util.UUID;

public class SessionNotFoundException extends RuntimeException {

    public SessionNotFoundException(UUID sessionId) {
        super("Session not found for id: " + sessionId);
    }
}
