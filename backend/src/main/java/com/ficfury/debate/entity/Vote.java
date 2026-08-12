package com.ficfury.debate.entity;

import java.time.LocalDateTime;

import com.ficfury.debate.entity.DebateSession;
import com.ficfury.model.User;

import jakarta.persistence.*;

@Entity
@Table(name = "votes")
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "session_id")
    private DebateSession session;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resolution_id")
    private Resolution resolution;
    @ManyToOne(optional = false)
    @JoinColumn(name = "delegate_id")
    private User delegate;

    @Enumerated(EnumType.STRING)
    private VoteType voteType;

    private LocalDateTime votedAt;

    public Vote() {
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

    public VoteType getVoteType() {
        return voteType;
    }

    public void setVoteType(VoteType voteType) {
        this.voteType = voteType;
    }

    public LocalDateTime getVotedAt() {
        return votedAt;
    }

    public void setVotedAt(LocalDateTime votedAt) {
        this.votedAt = votedAt;
    }

    public Resolution getResolution() {
    return resolution;
    }

    public void setResolution(Resolution resolution) {
        this.resolution = resolution;
    }
}