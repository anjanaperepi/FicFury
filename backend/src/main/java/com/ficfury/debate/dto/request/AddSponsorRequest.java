package com.ficfury.debate.dto.request;

public class AddSponsorRequest {

    private Long resolutionId;
    private Long delegateId;

    public AddSponsorRequest() {
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
}