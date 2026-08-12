package com.ficfury.dto;

import com.ficfury.model.ResourceCategory;
import com.ficfury.model.ResourceStatus;

import java.time.LocalDateTime;

public class ResourceResponse {

    private Long id;

    private String title;

    private String description;

    private ResourceCategory category;

    private String fileName;

    private String filePath;

    private String fileType;

    private String externalLink;

    private Integer version;

    private ResourceStatus status;

    private String adminFeedback;

    private Long committeeId;

    private String committeeName;

    private Long uploadedBy;

    private String uploadedByName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public ResourceResponse() {
    }

    public ResourceResponse(
            Long id,
            String title,
            String description,
            ResourceCategory category,
            String fileName,
            String filePath,
            String fileType,
            String externalLink,
            Integer version,
            ResourceStatus status,
            String adminFeedback,
            Long committeeId,
            String committeeName,
            Long uploadedBy,
            String uploadedByName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.externalLink = externalLink;
        this.version = version;
        this.status = status;
        this.adminFeedback = adminFeedback;
        this.committeeId = committeeId;
        this.committeeName = committeeName;
        this.uploadedBy = uploadedBy;
        this.uploadedByName = uploadedByName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id) {
        this.id = id;
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(
            String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(
            String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(
            String fileType) {
        this.fileType = fileType;
    }

    public String getExternalLink() {
        return externalLink;
    }

    public void setExternalLink(
            String externalLink) {
        this.externalLink = externalLink;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(
            Integer version) {
        this.version = version;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(
            ResourceStatus status) {
        this.status = status;
    }

    public String getAdminFeedback() {
        return adminFeedback;
    }

    public void setAdminFeedback(
            String adminFeedback) {
        this.adminFeedback = adminFeedback;
    }

    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(
            Long committeeId) {
        this.committeeId = committeeId;
    }

    public String getCommitteeName() {
        return committeeName;
    }

    public void setCommitteeName(
            String committeeName) {
        this.committeeName = committeeName;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(
            Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(
            String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}