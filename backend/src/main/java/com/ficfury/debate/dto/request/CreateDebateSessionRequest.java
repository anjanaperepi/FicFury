package com.ficfury.debate.dto.request;

public class CreateDebateSessionRequest {

    private Long committeeId;
    private Long chairId;

    public CreateDebateSessionRequest() {
    }

    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(Long committeeId) {
        this.committeeId = committeeId;
    }

    public Long getChairId() {
        return chairId;
    }

    public void setChairId(Long chairId) {
        this.chairId = chairId;
    }
}
