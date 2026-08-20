package com.ficfury.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "committee_withdrawal_requests")
@JsonIgnoreProperties({
    "hibernateLazyInitializer",
    "handler"
})
public class CommitteeWithdrawalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    @ManyToOne
    @JoinColumn(name = "committee_id", nullable = false)
    private Committee committee;


    @ManyToOne
    @JoinColumn(name = "registration_id", nullable = false)
    private Registration registration;


    @Column(length = 1000)
    private String reason;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;


    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;


    private LocalDateTime reviewedAt;


    @Column(length = 500)
    private String reviewComment;


    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;


    public CommitteeWithdrawalRequest() {
    }


    @PrePersist
    public void onCreate() {

        createdAt =
            LocalDateTime.now();

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


    public void setUser(User user) {
        this.user = user;
    }


    public Committee getCommittee() {
        return committee;
    }


    public void setCommittee(Committee committee) {
        this.committee = committee;
    }


    public Registration getRegistration() {
        return registration;
    }


    public void setRegistration(
        Registration registration
    ) {

        this.registration =
            registration;

    }


    public String getReason() {
        return reason;
    }


    public void setReason(String reason) {
        this.reason = reason;
    }


    public RequestStatus getStatus() {
        return status;
    }


    public void setStatus(RequestStatus status) {
        this.status = status;
    }


    public User getReviewer() {
        return reviewer;
    }


    public void setReviewer(User reviewer) {
        this.reviewer = reviewer;
    }


    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }


    public void setReviewedAt(
        LocalDateTime reviewedAt
    ) {

        this.reviewedAt =
            reviewedAt;

    }


    public String getReviewComment() {
        return reviewComment;
    }


    public void setReviewComment(
        String reviewComment
    ) {

        this.reviewComment =
            reviewComment;

    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(
        LocalDateTime createdAt
    ) {

        this.createdAt =
            createdAt;

    }

}