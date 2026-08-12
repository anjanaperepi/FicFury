package com.ficfury.debate.entity;

import java.time.LocalDateTime;

import com.ficfury.model.User;

import jakarta.persistence.*;

@Entity
@Table(name = "amendments")
public class Amendment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resolution_id")
    private Resolution resolution;

    @ManyToOne(optional = false)
    @JoinColumn(name = "delegate_id")
    private User proposedBy;

    @Enumerated(EnumType.STRING)
    private AmendmentType amendmentType;

@ManyToOne(optional = false)
@JoinColumn(name = "clause_id")
private ResolutionClause clause;

    @Column(columnDefinition = "TEXT")
    private String proposedText;

    @Enumerated(EnumType.STRING)
    private AmendmentStatus status;

    private LocalDateTime proposedAt;

    private LocalDateTime reviewedAt;

    private Integer insertAfterClauseNumber;
    @ManyToOne
@JoinColumn(name = "insert_after_clause_id")
private ResolutionClause insertAfterClause;

    public Amendment() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Resolution getResolution() {
        return resolution;
    }

    public void setResolution(Resolution resolution) {
        this.resolution = resolution;
    }

    public User getProposedBy() {
        return proposedBy;
    }

    public void setProposedBy(User proposedBy) {
        this.proposedBy = proposedBy;
    }

    public AmendmentType getAmendmentType() {
        return amendmentType;
    }

    public void setAmendmentType(AmendmentType amendmentType) {
        this.amendmentType = amendmentType;
    }

    public ResolutionClause getClause() {
    return clause;
}

public void setClause(ResolutionClause clause) {
    this.clause = clause;
}


    public String getProposedText() {
        return proposedText;
    }

    public void setProposedText(String proposedText) {
        this.proposedText = proposedText;
    }

    public AmendmentStatus getStatus() {
        return status;
    }

    public void setStatus(AmendmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getProposedAt() {
        return proposedAt;
    }

    public void setProposedAt(LocalDateTime proposedAt) {
        this.proposedAt = proposedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public ResolutionClause getInsertAfterClause() {
    return insertAfterClause;
}

public void setInsertAfterClause(ResolutionClause insertAfterClause) {
    this.insertAfterClause = insertAfterClause;
}
    // Generate getters and setters
}
