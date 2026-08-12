package com.ficfury.debate.dto.request;

public class UpdateResolutionRequest {

    private String title;
    private String content;

    public UpdateResolutionRequest() {
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

}