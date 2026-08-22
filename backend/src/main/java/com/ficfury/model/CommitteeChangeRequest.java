package com.ficfury.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "committee_change_requests")
@JsonIgnoreProperties({
    "hibernateLazyInitializer",
    "handler"
})
public class CommitteeChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /* =====================================================
       REQUESTER
    ===================================================== */

    @ManyToOne
    @JoinColumn(
        name = "user_id",
        nullable = false
    )
    private User user;


    /* =====================================================
       COMMITTEE
    ===================================================== */

    @ManyToOne
    @JoinColumn(
        name = "committee_id",
        nullable = false
    )
    private Committee committee;


    /* =====================================================
       PROPOSED CHANGES
    ===================================================== */

    @Column(nullable = false)
    private String committeeName;


    private String category;


    @Column(length = 2000)
    private String description;


    private String date;


    private String time;


    private String mode;


    private String venue;


    private String meetingLink;


    /* =====================================================
       REQUEST REASON
    ===================================================== */

    @Column(length = 2000)
    private String changeReason;


    /* =====================================================
       REQUEST STATUS
    ===================================================== */

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;


    /* =====================================================
       REVIEW
    ===================================================== */

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;


    private LocalDateTime reviewedAt;


    @Column(length = 1000)
    private String reviewComment;


    /* =====================================================
       CREATED
    ===================================================== */

    @Column(
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;


    public CommitteeChangeRequest() {
    }


    /* =====================================================
       CREATED AT
    ===================================================== */

    @PrePersist
    public void onCreate() {

        createdAt =
            LocalDateTime.now();

    }


    /* =====================================================
       GETTERS & SETTERS
    ===================================================== */

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


    public void setCommittee(
        Committee committee
    ) {
        this.committee =
            committee;
    }


    public String getCommitteeName() {
        return committeeName;
    }


    public void setCommitteeName(
        String committeeName
    ) {
        this.committeeName =
            committeeName;
    }


    public String getCategory() {
        return category;
    }


    public void setCategory(
        String category
    ) {
        this.category =
            category;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(
        String description
    ) {
        this.description =
            description;
    }


    public String getDate() {
        return date;
    }


    public void setDate(
        String date
    ) {
        this.date = date;
    }


    public String getTime() {
        return time;
    }


    public void setTime(
        String time
    ) {
        this.time = time;
    }


    public String getMode() {
        return mode;
    }


    public void setMode(
        String mode
    ) {
        this.mode = mode;
    }


    public String getVenue() {
        return venue;
    }


    public void setVenue(
        String venue
    ) {
        this.venue = venue;
    }


    public String getMeetingLink() {
        return meetingLink;
    }


    public void setMeetingLink(
        String meetingLink
    ) {
        this.meetingLink =
            meetingLink;
    }


    public String getChangeReason() {
        return changeReason;
    }


    public void setChangeReason(
        String changeReason
    ) {
        this.changeReason =
            changeReason;
    }


    public RequestStatus getStatus() {
        return status;
    }


    public void setStatus(
        RequestStatus status
    ) {
        this.status = status;
    }


    public User getReviewer() {
        return reviewer;
    }


    public void setReviewer(
        User reviewer
    ) {
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