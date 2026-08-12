package com.ficfury.debate.dto.response;

import java.time.LocalDateTime;

public class SponsorResponse {

    private Long id;
    private Long resolutionId;
    private Long delegateId;
    private String delegateName;
    private LocalDateTime sponsoredAt;

    public SponsorResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResolutionId() {
        return resolutionId;
    }

    public void setResolutionId(Long resolutionId) {
        this.resolutionId = resolutionId;
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

    public LocalDateTime getSponsoredAt() {
        return sponsoredAt;
    }

    public void setSponsoredAt(LocalDateTime sponsoredAt) {
        this.sponsoredAt = sponsoredAt;
    }
}
