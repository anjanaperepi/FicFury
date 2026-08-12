package com.ficfury.dto;

import com.ficfury.model.CertificateType;

import java.util.List;

public class CertificateGenerationRequest {

    private Long committeeId;

    private String eventName;

    private CertificateType certificateType;

    private List<Long> registrationIds;


    public CertificateGenerationRequest() {
    }


    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(Long committeeId) {
        this.committeeId = committeeId;
    }


    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }


    public CertificateType getCertificateType() {
        return certificateType;
    }

    public void setCertificateType(
            CertificateType certificateType
    ) {
        this.certificateType =
                certificateType;
    }


    public List<Long> getRegistrationIds() {
        return registrationIds;
    }

    public void setRegistrationIds(
            List<Long> registrationIds
    ) {
        this.registrationIds =
                registrationIds;
    }
}
