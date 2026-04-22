package com.webhookdebugger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WebhookDebuggerApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebhookDebuggerApplication.class, args);
    }
}