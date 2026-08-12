package com.ficfury.debate.dto.response;

import java.time.LocalDateTime;

import com.ficfury.debate.enums.SpeakerStatus;

public class SpeakerResponse {

    private Long id;

    private Long sessionId;

    private Long delegateId;

    private String delegateName;

    private Integer queuePosition;

    private Integer allottedTimeSeconds;

    private boolean timerRunning;

    public boolean isTimerRunning() {
        return timerRunning;
    }

    public void setTimerRunning(boolean timerRunning) {
        this.timerRunning = timerRunning;
    }

    private Integer remainingTimeSeconds;

    private SpeakerStatus status;

    private LocalDateTime requestedAt;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    public SpeakerResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDelegateName() {
        return delegateName;
    }

    public void setDelegateName(String delegateName) {
        this.delegateName = delegateName;
    }

    public Integer getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(Integer queuePosition) {
        this.queuePosition = queuePosition;
    }

    public Integer getAllottedTimeSeconds() {
        return allottedTimeSeconds;
    }

    public void setAllottedTimeSeconds(Integer allottedTimeSeconds) {
        this.allottedTimeSeconds = allottedTimeSeconds;
    }

    public Integer getRemainingTimeSeconds() {
        return remainingTimeSeconds;
    }

    public void setRemainingTimeSeconds(Integer remainingTimeSeconds) {
        this.remainingTimeSeconds = remainingTimeSeconds;
    }

    public SpeakerStatus getStatus() {
        return status;
    }

    public void setStatus(SpeakerStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    

    // getters & setters
}