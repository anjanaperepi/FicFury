package com.ficfury.debate.dto.response;

import java.time.LocalDateTime;

import com.ficfury.debate.entity.AmendmentStatus;
import com.ficfury.debate.entity.AmendmentType;

public class AmendmentResponse {

private Long id;

private Long resolutionId;

private Long delegateId;

private String delegateName;

private Long clauseId;

private Integer clauseNumber;

private String currentContent;

private String proposedText;

private AmendmentType amendmentType;

private AmendmentStatus status;

private LocalDateTime proposedAt;

private LocalDateTime reviewedAt;

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

public Long getClauseId() {
    return clauseId;
}

public void setClauseId(Long clauseId) {
    this.clauseId = clauseId;
}

public Integer getClauseNumber() {
    return clauseNumber;
}

public void setClauseNumber(Integer clauseNumber) {
    this.clauseNumber = clauseNumber;
}

public String getCurrentContent() {
    return currentContent;
}

public void setCurrentContent(String currentContent) {
    this.currentContent = currentContent;
}

public String getProposedText() {
    return proposedText;
}

public void setProposedText(String proposedText) {
    this.proposedText = proposedText;
}

public AmendmentType getAmendmentType() {
    return amendmentType;
}

public void setAmendmentType(AmendmentType amendmentType) {
    this.amendmentType = amendmentType;
}

public AmendmentStatus getStatus() {
    return status;
}

public void setStatus(AmendmentStatus status) {
    this.status = status;
}

public LocalDateTime getProposedAt() {
    return proposedAt;
}

public void setProposedAt(LocalDateTime proposedAt) {
    this.proposedAt = proposedAt;
}

public LocalDateTime getReviewedAt() {
    return reviewedAt;
}

public void setReviewedAt(LocalDateTime reviewedAt) {
    this.reviewedAt = reviewedAt;
}



}