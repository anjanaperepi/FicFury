package com.ficfury.debate.entity;

import com.ficfury.model.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "results")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "session_id",
            nullable = false,
            unique = true
    )
    private DebateSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "best_delegate_id")
    private User bestDelegate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outstanding_delegate_id")
    private User outstandingDelegate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "high_commendation_id")
    private User highCommendation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "special_mention_id")
    private User specialMention;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "best_position_paper_id")
    private User bestPositionPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "declared_by",
            nullable = false
    )
    private User declaredBy;

    private LocalDateTime declaredAt;

    public Result() {
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

    public User getBestDelegate() {
        return bestDelegate;
    }

    public void setBestDelegate(User bestDelegate) {
        this.bestDelegate = bestDelegate;
    }

    public User getOutstandingDelegate() {
        return outstandingDelegate;
    }

    public void setOutstandingDelegate(User outstandingDelegate) {
        this.outstandingDelegate = outstandingDelegate;
    }

    public User getHighCommendation() {
        return highCommendation;
    }

    public void setHighCommendation(User highCommendation) {
        this.highCommendation = highCommendation;
    }

    public User getSpecialMention() {
        return specialMention;
    }

    public void setSpecialMention(User specialMention) {
        this.specialMention = specialMention;
    }

    public User getBestPositionPaper() {
        return bestPositionPaper;
    }

    public void setBestPositionPaper(User bestPositionPaper) {
        this.bestPositionPaper = bestPositionPaper;
    }

    public User getDeclaredBy() {
        return declaredBy;
    }

    public void setDeclaredBy(User declaredBy) {
        this.declaredBy = declaredBy;
    }

    public LocalDateTime getDeclaredAt() {
        return declaredAt;
    }

    public void setDeclaredAt(LocalDateTime declaredAt) {
        this.declaredAt = declaredAt;
    }
}
