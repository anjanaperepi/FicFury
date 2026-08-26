package com.ficfury.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class CommitteeEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;


    public CommitteeEventPublisher(
            SimpMessagingTemplate messagingTemplate
    ) {

        this.messagingTemplate =
                messagingTemplate;
    }


    public void publish(
            Long sessionId,
            String type,
            Long actorId,
            Object payload
    ) {

        CommitteeEvent event =
                new CommitteeEvent(
                        type,
                        sessionId,
                        actorId,
                        payload
                );


        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId,
                event
        );
    }
    public void publishToUser(
        Long userId,
        Long sessionId,
        String type,
        Long actorId,
        Object payload
) {

    CommitteeEvent event =
            new CommitteeEvent(
                    type,
                    sessionId,
                    actorId,
                    payload
            );

    messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/diplomacy",
            event
    );
}
}