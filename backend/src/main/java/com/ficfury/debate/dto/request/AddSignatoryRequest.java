package com.ficfury.debate.dto.request;

public class AddSignatoryRequest {

    private Long resolutionId;
    private Long delegateId;

    public AddSignatoryRequest() {
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