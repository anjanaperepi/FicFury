package com.ficfury.debate.repository;

import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.entity.DiplomacyConversation;
import com.ficfury.debate.enums.ConversationType;
import com.ficfury.model.Registration;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DiplomacyConversationRepository
        extends JpaRepository<DiplomacyConversation, Long> {

    /*
     * All conversations belonging to a debate session.
     */
    List<DiplomacyConversation> findBySession(
            DebateSession session
    );


    /*
     * Find the public council conversation for a session.
     *
     * There should only ever be one PUBLIC conversation
     * per debate session.
     */
    Optional<DiplomacyConversation>
    findBySessionAndType(
            DebateSession session,
            ConversationType type
    );




    /*
     * Chair oversight:
     * retrieve every conversation in the session.
     */
    List<DiplomacyConversation>
    findBySessionOrderByCreatedAtAsc(
            DebateSession session
    );

    

}