package com.ficfury.debate.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "resolution_clauses")
public class ResolutionClause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resolution_id")
    private Resolution resolution;

    private Integer clauseNumber;

    @Enumerated(EnumType.STRING)
    private ClauseType clauseType;

    @Column(columnDefinition = "TEXT")
    private String content;


    @Column(nullable = false)
private boolean active = true;
    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    private LocalDateTime createdAt;

    public ResolutionClause() {
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

    public Integer getClauseNumber() {
        return clauseNumber;
    }

    public void setClauseNumber(Integer clauseNumber) {
        this.clauseNumber = clauseNumber;
    }

    public ClauseType getClauseType() {
        return clauseType;
    }

    public void setClauseType(ClauseType clauseType) {
        this.clauseType = clauseType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
