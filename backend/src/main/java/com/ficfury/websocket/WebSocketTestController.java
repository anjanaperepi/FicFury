package com.ficfury.websocket;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/websocket")
public class WebSocketTestController {

    private final CommitteeEventPublisher eventPublisher;

    public WebSocketTestController(
            CommitteeEventPublisher eventPublisher
    ) {
        this.eventPublisher = eventPublisher;
    }

    @PostMapping("/test/{sessionId}")
    public String test(
            @PathVariable Long sessionId
    ) {

        eventPublisher.publish(
                sessionId,
                "TEST_EVENT",
                null,
                "WebSocket connection is working!"
        );

        return "Test event published";
    }
}