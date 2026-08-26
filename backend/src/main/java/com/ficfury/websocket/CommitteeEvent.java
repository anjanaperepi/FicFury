package com.ficfury.websocket;

public class CommitteeEvent {

    private String type;

    private Long sessionId;

    private Long actorId;

    private Object payload;


    public CommitteeEvent() {
    }


    public CommitteeEvent(
            String type,
            Long sessionId,
            Long actorId,
            Object payload
    ) {

        this.type = type;
        this.sessionId = sessionId;
        this.actorId = actorId;
        this.payload = payload;
    }


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }


    public Long getActorId() {
        return actorId;
    }

    public void setActorId(Long actorId) {
        this.actorId = actorId;
    }


    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }
}