package com.ficfury.debate.entity;

import com.ficfury.debate.enums.ConversationType;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.model.Registration;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.List;


import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(
    name = "diplomacy_conversations"
)
public class DiplomacyConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /* =====================================================
       DEBATE SESSION
       ===================================================== */

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "session_id",
        nullable = false
    )
    private DebateSession session;


    /* =====================================================
       CONVERSATION TYPE
       ===================================================== */

    @Enumerated(EnumType.STRING)
    @Column(
        name = "conversation_type",
        nullable = false,
        length = 20
    )
    private ConversationType type;


/* =====================================================
   PARTICIPANTS

   For PUBLIC_COUNCIL this remains empty.

   For PUBLIC_GROUP and PRIVATE_GROUP this contains
   the delegates who are allowed to participate.
   ===================================================== */

@ManyToMany
@JoinTable(
    name = "diplomacy_conversation_participants",

    joinColumns = @JoinColumn(
        name = "conversation_id"
    ),

    inverseJoinColumns = @JoinColumn(
        name = "registration_id"
    )
)
private Set<Registration> participants =
        new HashSet<>();


    /* =====================================================
       CREATED
       ===================================================== */

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;


    /* =====================================================
       MESSAGES
       ===================================================== */

    @OneToMany(
        mappedBy = "conversation",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @OrderBy("createdAt ASC")
    private List<DiplomacyMessage> messages =
            new ArrayList<>();


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
       CONSTRUCTORS
       ===================================================== */

    public DiplomacyConversation() {
    }


    /* =====================================================
       GETTERS / SETTERS
       ===================================================== */

    public Long getId() {
        return id;
    }

    public DebateSession getSession() {
        return session;
    }

    public void setSession(DebateSession session) {
        this.session = session;
    }

    public ConversationType getType() {
        return type;
    }

    public void setType(ConversationType type) {
        this.type = type;
    }
public Set<Registration> getParticipants() {
    return participants;
}


public void setParticipants(
        Set<Registration> participants
) {
    this.participants = participants;
}


public void addParticipant(
        Registration registration
) {

    participants.add(registration);

}


public void removeParticipant(
        Registration registration
) {

    participants.remove(registration);

}

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<DiplomacyMessage> getMessages() {
        return messages;
    }

}