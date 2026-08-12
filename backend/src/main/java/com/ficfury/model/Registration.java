package com.ficfury.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({
    "hibernateLazyInitializer",
    "handler"
})
@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "committee_id")
    private Committee committee;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character character;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus workflowStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus adminApproval;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus chairApproval;


    // =====================
// Admin Review
// =====================

@ManyToOne
@JoinColumn(name = "admin_reviewer_id")
private User adminReviewer;

private LocalDateTime adminReviewedAt;

// =====================
// Chair Review
// =====================

@ManyToOne
@JoinColumn(name = "chair_reviewer_id")
private User chairReviewer;

private LocalDateTime chairReviewedAt;

// =====================
// Rejection
// =====================

@Column(length = 500)
private String rejectionReason;

    

   


    @Column(nullable = false, updatable = false)
    private LocalDateTime registeredAt;
    public Registration() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user
    ) {
        this.user = user;
    }

    public Committee getCommittee() {
        return committee;
    }

    public void setCommittee(
            Committee committee
    ) {
        this.committee = committee;
    }

    public Character getCharacter() {
        return character;
    }

    public void setCharacter(
            Character character
    ) {
        this.character = character;
    }


    public RegistrationStatus getWorkflowStatus() {
    return workflowStatus;
}

public void setWorkflowStatus(RegistrationStatus workflowStatus) {
    this.workflowStatus = workflowStatus;
}

public ApprovalStatus getAdminApproval() {
    return adminApproval;
}

public void setAdminApproval(ApprovalStatus adminApproval) {
    this.adminApproval = adminApproval;
}

public ApprovalStatus getChairApproval() {
    return chairApproval;
}

public void setChairApproval(ApprovalStatus chairApproval) {
    this.chairApproval = chairApproval;
}

    

    public LocalDateTime getRegisteredAt() {
    return registeredAt;
}

public void setRegisteredAt(LocalDateTime registeredAt) {
    this.registeredAt = registeredAt;
}
    @PrePersist
    public void onCreate() {

    registeredAt = LocalDateTime.now();

}
public User getAdminReviewer() {
    return adminReviewer;
}

public void setAdminReviewer(User adminReviewer) {
    this.adminReviewer = adminReviewer;
}

public LocalDateTime getAdminReviewedAt() {
    return adminReviewedAt;
}

public void setAdminReviewedAt(LocalDateTime adminReviewedAt) {
    this.adminReviewedAt = adminReviewedAt;
}

public User getChairReviewer() {
    return chairReviewer;
}

public void setChairReviewer(User chairReviewer) {
    this.chairReviewer = chairReviewer;
}

public LocalDateTime getChairReviewedAt() {
    return chairReviewedAt;
}

public void setChairReviewedAt(LocalDateTime chairReviewedAt) {
    this.chairReviewedAt = chairReviewedAt;
}

public String getRejectionReason() {
    return rejectionReason;
}

public void setRejectionReason(String rejectionReason) {
    this.rejectionReason = rejectionReason;
}

}
