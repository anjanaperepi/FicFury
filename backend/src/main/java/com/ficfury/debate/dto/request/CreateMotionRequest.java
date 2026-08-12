package com.ficfury.debate.dto.request;

import com.ficfury.debate.enums.MotionPriority;
import com.ficfury.debate.enums.MotionType;

public class CreateMotionRequest {

    private Long sessionId;

    private Long delegateId;

    private MotionType motionType;

    private Integer durationMinutes;

    private String purpose;

    private MotionPriority priority;

    public CreateMotionRequest() {
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

    public MotionType getMotionType() {
        return motionType;
    }

    public void setMotionType(MotionType motionType) {
        this.motionType = motionType;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public MotionPriority getPriority() {
        return priority;
    }

    public void setPriority(MotionPriority priority) {
        this.priority = priority;
    }
}