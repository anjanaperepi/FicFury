package com.ficfury.debate.entity;

import com.ficfury.debate.enums.MotionPriority;
import com.ficfury.debate.enums.MotionStatus;
import com.ficfury.debate.enums.MotionType;
import com.ficfury.model.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "motions")
public class Motion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "session_id",
            nullable = false
    )
    private DebateSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "delegate_id",
            nullable = false
    )
    private User delegate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MotionType motionType;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private String purpose;

@Enumerated(EnumType.STRING)
@Column(nullable = false)
private MotionPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MotionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime reviewedAt;
    

    public Motion() {
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

    public User getDelegate() {
        return delegate;
    }

    public void setDelegate(User delegate) {
        this.delegate = delegate;
    }

    public MotionType getMotionType() {
        return motionType;
    }

    public void setMotionType(MotionType motionType) {
        this.motionType = motionType;
    }

    


    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

public MotionPriority getPriority() {
    return priority;
}

public void setPriority(MotionPriority priority) {
    this.priority = priority;
}

    public MotionStatus getStatus() {
        return status;
    }

    public void setStatus(MotionStatus status) {
        this.status = status;
    }

    public User getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}