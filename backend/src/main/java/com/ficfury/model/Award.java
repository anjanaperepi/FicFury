package com.ficfury.model;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "awards")
public class Award {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registration_id", nullable = false)
    private Registration registration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AwardType awardType;

    @Column(length = 1000)
    private String citation;

    private String presentedBy;

    private LocalDate presentedDate;

    @Column(length = 1000)
    private String remarks;

    public Award() {
        this.presentedDate = LocalDate.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public AwardType getAwardType() {
        return awardType;
    }

    public void setAwardType(AwardType awardType) {
        this.awardType = awardType;
    }

    public String getCitation() {
        return citation;
    }

    public void setCitation(String citation) {
        this.citation = citation;
    }

    public String getPresentedBy() {
        return presentedBy;
    }

    public void setPresentedBy(String presentedBy) {
        this.presentedBy = presentedBy;
    }

    public LocalDate getPresentedDate() {
        return presentedDate;
    }

    public void setPresentedDate(LocalDate presentedDate) {
        this.presentedDate = presentedDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}