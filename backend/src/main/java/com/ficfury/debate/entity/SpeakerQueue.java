package com.ficfury.debate.entity;

import java.time.LocalDateTime;

import com.ficfury.debate.enums.SpeakerStatus;
import com.ficfury.model.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "speaker_queue")
public class SpeakerQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(
            name = "session_id",
            nullable = false)
    private DebateSession session;

    @ManyToOne
    @JoinColumn(
            name = "delegate_id",
            nullable = false)
    private User delegate;

    @Column(nullable = false)
    private Integer queuePosition;

    @Column(nullable = false)
    private Integer allottedTimeSeconds;

    @Column(nullable = false)
    private Integer remainingTimeSeconds;


private boolean timerRunning;

private LocalDateTime timerStartedAt;



    

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpeakerStatus status;

    private LocalDateTime requestedAt;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;





    public SpeakerQueue() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DebateSession getSession() {
        return session;
    }

    public void setSession(DebateSession session) {
        this.session = session;
    }

    public User getDelegate() {
        return delegate;
    }

    public void setDelegate(User delegate) {
        this.delegate = delegate;
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

    public boolean isTimerRunning() {
    return timerRunning;
}

public void setTimerRunning(boolean timerRunning) {
    this.timerRunning = timerRunning;
}

public LocalDateTime getTimerStartedAt() {
    return timerStartedAt;
}

public void setTimerStartedAt(LocalDateTime timerStartedAt) {
    this.timerStartedAt = timerStartedAt;
}

    // Generate getters & setters
}
