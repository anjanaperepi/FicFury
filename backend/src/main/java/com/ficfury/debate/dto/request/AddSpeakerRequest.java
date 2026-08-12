package com.ficfury.debate.dto.request;

public class AddSpeakerRequest {

    private Long sessionId;

    private Long delegateId;

    private Integer allottedTimeSeconds;

    public AddSpeakerRequest() {
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Long getDelegateId() {
        return delegateId;
    }

    public void setDelegateId(Long delegateId) {
        this.delegateId = delegateId;
    }

    public Integer getAllottedTimeSeconds() {
        return allottedTimeSeconds;
    }

    public void setAllottedTimeSeconds(Integer allottedTimeSeconds) {
        this.allottedTimeSeconds = allottedTimeSeconds;
    }

    // getters & setters
}
