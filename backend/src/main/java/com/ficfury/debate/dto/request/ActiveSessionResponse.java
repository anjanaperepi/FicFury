package com.ficfury.debate.dto.request;

import java.time.LocalDateTime;

import java.time.LocalDateTime;

public class ActiveSessionResponse {

    private Long id;

    private String status;

    private Boolean active;

    private LocalDateTime activatedAt;

    private Long committeeId;

    private String committeeName;

    private Long chairId;

    private String chairName;

    public ActiveSessionResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getActivatedAt() {
    return activatedAt;
    }

    public void setActivatedAt(LocalDateTime activatedAt) {
    this.activatedAt = activatedAt;
    }

    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(Long committeeId) {
        this.committeeId = committeeId;
    }

    public String getCommitteeName() {
        return committeeName;
    }

    public void setCommitteeName(String committeeName) {
        this.committeeName = committeeName;
    }

    public Long getChairId() {
        return chairId;
    }

    public void setChairId(Long chairId) {
        this.chairId = chairId;
    }

    public String getChairName() {
        return chairName;
    }

    public void setChairName(String chairName) {
        this.chairName = chairName;
    }

}
