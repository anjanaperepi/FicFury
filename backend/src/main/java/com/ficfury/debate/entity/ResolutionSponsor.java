package com.ficfury.debate.entity;

import java.time.LocalDateTime;

import com.ficfury.model.User;

import jakarta.persistence.*;

@Entity
@Table(name = "resolution_sponsors")
public class ResolutionSponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resolution_id")
    private Resolution resolution;

    @ManyToOne(optional = false)
    @JoinColumn(name = "delegate_id")
    private User delegate;

    private LocalDateTime sponsoredAt;

    public ResolutionSponsor() {
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

    public User getDelegate() {
        return delegate;
    }

    public void setDelegate(User delegate) {
        this.delegate = delegate;
    }

    public LocalDateTime getSponsoredAt() {
        return sponsoredAt;
    }

    public void setSponsoredAt(LocalDateTime sponsoredAt) {
        this.sponsoredAt = sponsoredAt;
    }
}
