package com.ficfury.debate.dto.response;

import java.time.LocalDateTime;

import com.ficfury.debate.entity.VoteType;

public class VoteResponse {

    private Long id;
    private Long sessionId;
    private Long resolutionId;
    private String resolutionTitle;
    private Long delegateId;
    private String delegateName;
    private VoteType voteType;
    private LocalDateTime votedAt;

    public VoteResponse() {
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

    public Long getResolutionId() {
        return resolutionId;
    }

    public void setResolutionId(Long resolutionId) {
        this.resolutionId = resolutionId;
    }

    public String getResolutionTitle() {
        return resolutionTitle;
    }

    public void setResolutionTitle(String resolutionTitle) {
        this.resolutionTitle = resolutionTitle;
    }
}