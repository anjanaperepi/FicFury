package com.ficfury.debate.dto.response;

import java.time.LocalDateTime;

import com.ficfury.debate.enums.MotionPriority;
import com.ficfury.debate.enums.MotionStatus;
import com.ficfury.debate.enums.MotionType;

public class MotionResponse {

    private Long id;

    private Long sessionId;

    private Long delegateId;
    private String delegateName;

    private MotionType motionType;

    private Integer durationMinutes;

    private String purpose;

    private MotionPriority priority;

    private MotionStatus status;

    private Long reviewedById;
    private String reviewedByName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime reviewedAt;

    public MotionResponse() {
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

    public MotionStatus getStatus() {
        return status;
    }

    public void setStatus(MotionStatus status) {
        this.status = status;
    }

    public Long getReviewedById() {
        return reviewedById;
    }

    public void setReviewedById(Long reviewedById) {
        this.reviewedById = reviewedById;
    }

    public String getReviewedByName() {
        return reviewedByName;
    }

    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    
}