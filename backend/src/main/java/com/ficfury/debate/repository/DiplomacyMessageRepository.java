package com.ficfury.debate.repository;

import com.ficfury.debate.entity.DiplomacyConversation;
import com.ficfury.debate.entity.DiplomacyMessage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiplomacyMessageRepository
        extends JpaRepository<DiplomacyMessage, Long> {

    List<DiplomacyMessage>
    findByConversationOrderByCreatedAtAsc(
            DiplomacyConversation conversation
    );

    List<DiplomacyMessage>
    findTop1ByConversationOrderByCreatedAtDesc(
            DiplomacyConversation conversation
    );

}