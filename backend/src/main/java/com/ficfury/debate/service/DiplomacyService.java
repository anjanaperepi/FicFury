package com.ficfury.debate.service;

import com.ficfury.debate.entity.DiplomacyConversation;
import com.ficfury.debate.entity.DiplomacyMessage;
import com.ficfury.debate.enums.ConversationType;
import com.ficfury.dto.CommitteeDelegateDTO;

import java.util.List;

public interface DiplomacyService {

    /*
     * Get the public council conversation for
     * the active session.
     *
     * Creates it if it does not exist yet.
     */
    DiplomacyConversation getOrCreatePublicCouncil(
            Long sessionId,
            Long userId
    );


    /*
     * Get conversations visible to the current user.
     */
    List<DiplomacyConversation> getVisibleConversations(
            Long sessionId,
            Long userId
    );


    List<CommitteeDelegateDTO> getSessionParticipants(
        Long sessionId,
        Long userId
);

    /*
     * Create a group conversation.
     */
    DiplomacyConversation createConversation(
            Long sessionId,
            Long creatorUserId,
            ConversationType type,
            List<Long> participantRegistrationIds
    );


    /*
     * Get messages from a conversation.
     */
    List<DiplomacyMessage> getMessages(
            Long conversationId,
            Long userId
    );


    /*
     * Send a message.
     */
    DiplomacyMessage sendMessage(
            Long conversationId,
            Long senderUserId,
            String content
    );


    /*
     * Chair oversight:
     * retrieve every conversation in the session.
     */
    List<DiplomacyConversation> getAllConversationsForChair(
            Long sessionId,
            Long chairUserId

            
    );

    List<DiplomacyMessage> getMessagesForChair(
        Long conversationId,
        Long chairUserId
);

}