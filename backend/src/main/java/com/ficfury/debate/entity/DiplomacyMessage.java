package com.ficfury.debate.entity;

import com.ficfury.model.User;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "diplomacy_messages")
public class DiplomacyMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /* =====================================================
       CONVERSATION
       ===================================================== */

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "conversation_id",
        nullable = false
    )
    private DiplomacyConversation conversation;


    /* =====================================================
       SENDER
       ===================================================== */

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "sender_id",
        nullable = false
    )
    private User sender;


    /* =====================================================
       MESSAGE CONTENT
       ===================================================== */

    @Column(
        name = "content",
        nullable = false,
        columnDefinition = "TEXT"
    )
    private String content;


    /* =====================================================
       TIMESTAMP
       ===================================================== */

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;


    /* =====================================================
       LIFECYCLE
       ===================================================== */

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

    }


    /* =====================================================
       CONSTRUCTOR
       ===================================================== */

    public DiplomacyMessage() {
    }


    /* =====================================================
       GETTERS / SETTERS
       ===================================================== */

    public Long getId() {
        return id;
    }

    public DiplomacyConversation getConversation() {
        return conversation;
    }

    public void setConversation(
            DiplomacyConversation conversation
    ) {
        this.conversation = conversation;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
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

}