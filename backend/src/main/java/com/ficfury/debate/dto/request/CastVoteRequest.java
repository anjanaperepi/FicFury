package com.ficfury.debate.dto.request;

import com.ficfury.debate.entity.VoteType;

public class CastVoteRequest {

private Long sessionId;
private Long resolutionId;

private Long delegateId;
private VoteType voteType;

    public CastVoteRequest() {
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

    public VoteType getVoteType() {
        return voteType;
    }

    public void setVoteType(VoteType voteType) {
        this.voteType = voteType;
    }





    public Long getResolutionId() {
    return resolutionId;
    }

    public void setResolutionId(Long resolutionId) {
        this.resolutionId = resolutionId;
    }

}