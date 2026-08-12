package com.ficfury.debate.dto.request;

public class AnnouncementRequest {

    private Long sessionId;
    private Long chairId;

    private String title;
    private String message;

    private Boolean pinned = false;

    public AnnouncementRequest() {
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Long getChairId() {
        return chairId;
    }

    public void setChairId(Long chairId) {
        this.chairId = chairId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getPinned() {
        return pinned;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }

}