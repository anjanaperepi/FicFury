package com.ficfury.dto;

import com.ficfury.model.AnnouncementAudience;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MainAnnouncementRequest {

    private String title;

    private String content;

    private Long committeeId;

    private String committeeName;

    private String status;

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

    public void setAudience(AnnouncementAudience audience) {
    this.audience = audience;
}
}