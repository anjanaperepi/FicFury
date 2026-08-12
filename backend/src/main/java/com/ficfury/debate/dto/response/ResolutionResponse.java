package com.ficfury.debate.dto.response;

import java.time.LocalDateTime;

import com.ficfury.debate.entity.ResolutionStatus;

public class ResolutionResponse {

    private Long id;

    private Long sessionId;

    private Long submittedById;

    private String submittedByName;

    private String title;

    private String content;

    private ResolutionStatus status;
    private Long sponsorCount;

    private Long signatoryCount;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    private Integer requiredSponsors;

    private Integer requiredSignatories;


    public ResolutionResponse() {
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

    public Long getSubmittedById() {
        return submittedById;
    }

    public void setSubmittedById(Long submittedById) {
        this.submittedById = submittedById;
    }

    public String getSubmittedByName() {
        return submittedByName;
    }

    public void setSubmittedByName(String submittedByName) {
        this.submittedByName = submittedByName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public ResolutionStatus getStatus() {
        return status;
    }

    public void setStatus(ResolutionStatus status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
public Long getSponsorCount() {
    return sponsorCount;
}

public void setSponsorCount(Long sponsorCount) {
    this.sponsorCount = sponsorCount;
}

public Long getSignatoryCount() {
    return signatoryCount;
}

public void setSignatoryCount(Long signatoryCount) {
    this.signatoryCount = signatoryCount;
}
   

public Integer getRequiredSponsors() {
    return requiredSponsors;
}

public void setRequiredSponsors(Integer requiredSponsors) {
    this.requiredSponsors = requiredSponsors;
}



public Integer getRequiredSignatories() {
    return requiredSignatories;
}

public void setRequiredSignatories(Integer requiredSignatories) {
    this.requiredSignatories = requiredSignatories;
}
// Generate getters and setters
}
