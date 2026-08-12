package com.ficfury.debate.entity;

import com.ficfury.debate.enums.SessionStatus;
import jakarta.persistence.*;
import com.ficfury.model.Committee;
import com.ficfury.model.User;


import java.time.LocalDateTime;

@Entity
@Table(name = "debate_sessions")
public class DebateSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(
            name = "committee_id",
            nullable = false
    )
    private Committee committee;

    @ManyToOne
    @JoinColumn(
            name = "chair_id",
            nullable = false
    )
    private User chair;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Column(nullable = false)
    private Boolean active = false;

    private LocalDateTime createdAt;

    private LocalDateTime initiatedAt;

    private LocalDateTime activatedAt;

    private LocalDateTime endedAt;

    private LocalDateTime archivedAt;

    @Column(nullable = false)
    private Integer requiredSponsors = 2;

    @Column(nullable = false)
    private Integer requiredSignatories = 3;





 



    public DebateSession() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Committee getCommittee() {
        return committee;
    }

    public void setCommittee(Committee committee) {
        this.committee = committee;
    }

    public User getChair() {
        return chair;
    }

    public void setChair(User chair) {
        this.chair = chair;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getInitiatedAt() {
        return initiatedAt;
    }

    public void setInitiatedAt(LocalDateTime initiatedAt) {
        this.initiatedAt = initiatedAt;
    }

    public LocalDateTime getActivatedAt() {
        return activatedAt;
    }

    public void setActivatedAt(LocalDateTime activatedAt) {
        this.activatedAt = activatedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }

    public Integer getRequiredSponsors() {
        return requiredSponsors;
    }

    public void setRequiredSponsors(Integer requiredSponsors) {
        this.requiredSponsors = requiredSponsors;
    }

    public Integer getRequiredSignatories() {
        return requiredSignatories;
    }

    public void setRequiredSignatories(Integer requiredSignatories) {
        this.requiredSignatories = requiredSignatories;
    }

}