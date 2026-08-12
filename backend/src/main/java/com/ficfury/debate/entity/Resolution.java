package com.ficfury.debate.entity;

import java.time.LocalDateTime;

import com.ficfury.model.User;

import jakarta.persistence.*;

@Entity
@Table(name = "resolutions")
public class Resolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "session_id")
    private DebateSession session;

    @ManyToOne(optional = false)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @Column(nullable = false)
    private String title;

    @Lob
    private String content;

    @Enumerated(EnumType.STRING)
    private ResolutionStatus status;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    public Resolution() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DebateSession getSession() {
        return session;
    }

    public void setSession(DebateSession session) {
        this.session = session;
    }

    public User getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(User submittedBy) {
        this.submittedBy = submittedBy;
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

}
