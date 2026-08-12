package com.ficfury.dto;

public class AwardRequest {

    

    private Long committeeId;

    private String awardType;

    public AwardRequest() {
    }

    

    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(
            Long committeeId
    ) {
        this.committeeId = committeeId;
    }

    public String getAwardType() {
        return awardType;
    }

    public void setAwardType(
            String awardType
    ) {
        this.awardType = awardType;
    }

}