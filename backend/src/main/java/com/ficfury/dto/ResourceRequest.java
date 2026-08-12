package com.ficfury.dto;

import com.ficfury.model.ResourceCategory;

public class ResourceRequest {

    private String title;

    private String description;

    private ResourceCategory category;

    private Long committeeId;

    private String externalLink;

    public ResourceRequest() {
    }

    public ResourceRequest(
            String title,
            String description,
            ResourceCategory category,
            Long committeeId,
            String externalLink) {

        this.title = title;
        this.description = description;
        this.category = category;
        this.committeeId = committeeId;
        this.externalLink = externalLink;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description) {
        this.description = description;
    }

    public ResourceCategory getCategory() {
        return category;
    }

    public void setCategory(
            ResourceCategory category) {
        this.category = category;
    }

    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(
            Long committeeId) {
        this.committeeId = committeeId;
    }

    public String getExternalLink() {
        return externalLink;
    }

    public void setExternalLink(
            String externalLink) {
        this.externalLink = externalLink;
    }
}