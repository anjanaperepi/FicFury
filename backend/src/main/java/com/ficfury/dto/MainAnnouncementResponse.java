package com.ficfury.dto;

import lombok.*;

import java.time.LocalDateTime;

import com.ficfury.model.AnnouncementAudience;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MainAnnouncementResponse {

    private Long id;

    private String title;

    private String content;

    private Long committeeId;

    private String committeeName;

    private Long createdBy;

    private String createdByName;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime publishedAt;

    private AnnouncementAudience audience;


    
 public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public Long getCommitteeId() {
        return committeeId;
    }

    public String getCommitteeName() {
        return committeeName;
    }

    public String getStatus() {
        return status;
    }


    public AnnouncementAudience getAudience() {
    return audience;
}
    // =========================
    // SETTERS
    // =========================

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCommitteeId(Long committeeId) {
        this.committeeId = committeeId;
    }

    public void setCommitteeName(String committeeName) {
        this.committeeName = committeeName;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getId() {
    return id;
}

public Long getCreatedBy() {
    return createdBy;
}

public String getCreatedByName() {
    return createdByName;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public LocalDateTime getUpdatedAt() {
    return updatedAt;
}

public LocalDateTime getPublishedAt() {
    return publishedAt;
}


// =========================
// REMAINING SETTERS
// =========================

public void setId(Long id) {
    this.id = id;
}

public void setCreatedBy(Long createdBy) {
    this.createdBy = createdBy;
}

public void setCreatedByName(String createdByName) {
    this.createdByName = createdByName;
}

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}

public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
}

public void setPublishedAt(LocalDateTime publishedAt) {
    this.publishedAt = publishedAt;
}

public void setAudience(AnnouncementAudience audience) {
    this.audience = audience;
}
}

