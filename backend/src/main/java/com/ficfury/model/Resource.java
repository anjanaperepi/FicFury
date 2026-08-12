package com.ficfury.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceCategory category;

    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String fileType;

    private String externalLink;

    @Column(nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    @Column(length = 1000)
    private String adminFeedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "committee_id", nullable = false)
    private Committee committee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Resource() {
    }

    public Resource(
            String title,
            String description,
            ResourceCategory category,
            String fileName,
            String filePath,
            String fileType,
            String externalLink,
            Integer version,
            ResourceStatus status,
            Committee committee,
            User uploadedBy) {

        this.title = title;
        this.description = description;
        this.category = category;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.externalLink = externalLink;
        this.version = version;
        this.status = status;
        this.committee = committee;
        this.uploadedBy = uploadedBy;
    }

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = createdAt;

        if (version == null)
            version = 1;

        if (status == null)
            status = ResourceStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ResourceCategory getCategory() {
        return category;
    }

    public void setCategory(ResourceCategory category) {
        this.category = category;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getExternalLink() {
        return externalLink;
    }

    public void setExternalLink(String externalLink) {
        this.externalLink = externalLink;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public String getAdminFeedback() {
        return adminFeedback;
    }

    public void setAdminFeedback(String adminFeedback) {
        this.adminFeedback = adminFeedback;
    }

    public Committee getCommittee() {
        return committee;
    }

    public void setCommittee(Committee committee) {
        this.committee = committee;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {

        if (this == o)
            return true;

        if (!(o instanceof Resource))
            return false;

        Resource resource = (Resource) o;

        return Objects.equals(id, resource.id);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }

    @Override
    public String toString() {

        return "Resource{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", category=" + category +
                '}';
    }
}