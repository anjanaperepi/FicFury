package com.ficfury.debate.entity;

import com.ficfury.model.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {

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
            name = "chair_id",
            nullable = false
    )
    private User chair;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

@Column(nullable = false)
private Boolean pinned = false;

    private LocalDateTime createdAt;

    public Announcement() {
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

    public User getChair() {
        return chair;
    }

    public void setChair(User chair) {
        this.chair = chair;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public Boolean getPinned() {
    return pinned;
}

public void setPinned(Boolean pinned) {
    this.pinned = pinned;
}
}
