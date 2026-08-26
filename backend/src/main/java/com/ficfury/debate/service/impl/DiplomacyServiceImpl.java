package com.ficfury.debate.service.impl;

import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.entity.DiplomacyConversation;
import com.ficfury.debate.entity.DiplomacyMessage;
import com.ficfury.debate.enums.ConversationType;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.debate.repository.DiplomacyConversationRepository;
import com.ficfury.debate.repository.DiplomacyMessageRepository;
import com.ficfury.debate.service.DiplomacyService;
import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.model.User;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.repository.UserRepository;
import com.ficfury.dto.CommitteeDelegateDTO;
import com.ficfury.websocket.CommitteeEventPublisher;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class DiplomacyServiceImpl
        implements DiplomacyService {

    private final DebateSessionRepository sessionRepository;

    private final DiplomacyConversationRepository
            conversationRepository;

    private final DiplomacyMessageRepository
            messageRepository;

    private final RegistrationRepository
            registrationRepository;

    private final UserRepository
            userRepository;


private final CommitteeEventPublisher committeeEventPublisher;


public DiplomacyServiceImpl(
        DebateSessionRepository sessionRepository,
        DiplomacyConversationRepository conversationRepository,
        DiplomacyMessageRepository messageRepository,
        RegistrationRepository registrationRepository,
        UserRepository userRepository,
        CommitteeEventPublisher committeeEventPublisher
) {

    this.sessionRepository = sessionRepository;
    this.conversationRepository = conversationRepository;
    this.messageRepository = messageRepository;
    this.registrationRepository = registrationRepository;
    this.userRepository = userRepository;
    this.committeeEventPublisher = committeeEventPublisher;
}


    /* =====================================================
       PUBLIC COUNCIL
       ===================================================== */

    @Override
    public DiplomacyConversation
    getOrCreatePublicCouncil(
            Long sessionId,
            Long userId
    ) {

        DebateSession session =
                getActiveSession(sessionId);

        requireActiveParticipant(
                session,
                userId
        );


        return conversationRepository
                .findBySessionAndType(
                        session,
                        ConversationType.PUBLIC_COUNCIL
                )
                .orElseGet(() -> {

                    DiplomacyConversation conversation =
                            new DiplomacyConversation();

                    conversation.setSession(session);

                    conversation.setType(
                            ConversationType.PUBLIC_COUNCIL
                    );

                    return conversationRepository.save(
                            conversation
                    );
                });
    }


    /* =====================================================
       VISIBLE CONVERSATIONS
       ===================================================== */

    @Override
    @Transactional(readOnly = true)
    public List<DiplomacyConversation>
    getVisibleConversations(
            Long sessionId,
            Long userId
    ) {

        DebateSession session =
                getActiveSession(sessionId);

        Registration registration =
                requireActiveParticipant(
                        session,
                        userId
                );


        List<DiplomacyConversation> conversations =
                conversationRepository
                        .findBySessionOrderByCreatedAtAsc(
                                session
                        );


        /*
         * PUBLIC_COUNCIL:
         * Everyone can see it.
         *
         * PUBLIC_GROUP:
         * Everyone can see it.
         *
         * PRIVATE_GROUP:
         * Only participants can see it.
         */
        return conversations
                .stream()
                .filter(conversation -> {

                    if (
                        conversation.getType()
                            == ConversationType.PUBLIC_COUNCIL
                    ) {
                        return true;
                    }

                    if (
                        conversation.getType()
                            == ConversationType.PUBLIC_GROUP
                    ) {
                        return true;
                    }

                    return conversation
                            .getParticipants()
                            .contains(registration);

                })
                .collect(Collectors.toList());
    }

@Override
@Transactional(readOnly = true)
public List<CommitteeDelegateDTO> getSessionParticipants(
        Long sessionId,
        Long userId
) {

    /*
     * Make sure the session exists and is active.
     */
    DebateSession session =
            getActiveSession(sessionId);

    /*
     * The requesting user MUST be an active
     * participant in this session.
     *
     * This prevents delegates from using the
     * endpoint to inspect another committee.
     */
    requireActiveParticipant(
            session,
            userId
    );

    /*
     * Get registrations belonging to the
     * session's committee.
     */
    List<Registration> registrations =
            registrationRepository
                    .findByCommittee_Id(
                            session
                                    .getCommittee()
                                    .getId()
                    );

    /*
     * Return only ACTIVE registrations and
     * convert them into the lightweight DTO.
     */
    return registrations
            .stream()
            .filter(registration ->
                    registration.getWorkflowStatus()
                            == RegistrationStatus.ACTIVE
            )
            .map(registration ->
                    new CommitteeDelegateDTO(
                            registration.getId(),

                            registration.getUser() != null
                                    ? registration.getUser().getId()
                                    : null,

                            registration.getUser() != null
                                    ? registration.getUser().getFullName()
                                    : null,

                            registration.getUser() != null
                                    ? registration.getUser().getEmail()
                                    : null,

                            registration.getCharacter() != null
                                    ? registration.getCharacter().getName()
                                    : null,

                            registration.getCommittee() != null
                                    ? registration.getCommittee().getName()
                                    : null,

                            registration.getWorkflowStatus() != null
                                    ? registration.getWorkflowStatus().name()
                                    : null,

                            registration.getRegisteredAt()
                    )
            )
            .collect(Collectors.toList());
}
    /* =====================================================
       CREATE CONVERSATION
       ===================================================== */

    @Override
    public DiplomacyConversation
    createConversation(
            Long sessionId,
            Long creatorUserId,
            ConversationType type,
            List<Long> participantRegistrationIds
    ) {

        DebateSession session =
                getActiveSession(sessionId);


        Registration creator =
                requireActiveParticipant(
                        session,
                        creatorUserId
                );


        if (
            type == ConversationType.PUBLIC_COUNCIL
        ) {

            return getOrCreatePublicCouncil(
                    sessionId,
                    creatorUserId
            );
        }


        if (
            participantRegistrationIds == null ||
            participantRegistrationIds.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "At least one participant is required."
            );
        }


        Set<Registration> participants =
                new HashSet<>();


        for (
            Long registrationId :
            participantRegistrationIds
        ) {

            Registration registration =
                    registrationRepository
                            .findById(registrationId)
                            .orElseThrow(() ->
                                new IllegalArgumentException(
                                    "Participant registration not found."
                                )
                            );


            validateRegistrationBelongsToSession(
                    registration,
                    session
            );


            participants.add(registration);
        }


        /*
         * The creator must always be included.
         */
        participants.add(creator);


        /*
         * PUBLIC_GROUP and PRIVATE_GROUP
         * both require at least two participants.
         */
        if (participants.size() < 2) {

            throw new IllegalArgumentException(
                    "A group conversation requires at least two participants."
            );
        }


        /*
         * Prevent duplicate groups.
         */
        List<DiplomacyConversation> existing =
                conversationRepository
                        .findBySessionOrderByCreatedAtAsc(
                                session
                        );


        for (
            DiplomacyConversation conversation :
            existing
        ) {

            if (
                conversation.getType() != type
            ) {
                continue;
            }


            if (
                conversation.getParticipants()
                        .equals(participants)
            ) {

                return conversation;
            }
        }


        DiplomacyConversation conversation =
                new DiplomacyConversation();

        conversation.setSession(session);

        conversation.setType(type);

        conversation.setParticipants(
                participants
        );


DiplomacyConversation savedConversation =
        conversationRepository.save(conversation);

Set<Long> recipientUserIds =
        new HashSet<>();

/*
 * Creator always receives the event.
 */
recipientUserIds.add(creatorUserId);

/*
 * PUBLIC_GROUP:
 * Everyone in the active session can see it.
 */
if (
        type == ConversationType.PUBLIC_GROUP
) {

    List<CommitteeDelegateDTO> delegates =
            getSessionParticipants(
                    sessionId,
                    creatorUserId
            );

    for (
            CommitteeDelegateDTO delegate :
            delegates
    ) {

        if (delegate.getUserId() != null) {

            recipientUserIds.add(
                    delegate.getUserId()
            );
        }
    }
}

/*
 * PRIVATE_GROUP:
 * Only selected participants receive it.
 */
else {

    for (
            Registration participant :
            savedConversation.getParticipants()
    ) {

        if (participant.getUser() != null) {

            recipientUserIds.add(
                    participant.getUser().getId()
            );
        }
    }
}

/*
 * Chair has diplomacy oversight access.
 */
if (
        session.getChair() != null &&
        session.getChair().getId() != null
) {

    recipientUserIds.add(
            session.getChair().getId()
    );
}

/*
 * Send privately to authorized recipients.
 */
for (Long recipientUserId : recipientUserIds) {

    committeeEventPublisher.publishToUser(
            recipientUserId,
            sessionId,
            "CONVERSATION_CREATED",
            creatorUserId,
            savedConversation.getId()
    );
}

return savedConversation;
    }



    /* =====================================================
       GET MESSAGES
       ===================================================== */

    @Override
    @Transactional(readOnly = true)
    public List<DiplomacyMessage>
    getMessages(
            Long conversationId,
            Long userId
    ) {

        DiplomacyConversation conversation =
                conversationRepository
                        .findById(conversationId)
                        .orElseThrow(() ->
                            new IllegalArgumentException(
                                "Conversation not found."
                            )
                        );


        authorizeConversationRead(
                conversation,
                userId
        );


        return messageRepository
                .findByConversationOrderByCreatedAtAsc(
                        conversation
                );
    }


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    @Override
    public DiplomacyMessage sendMessage(
            Long conversationId,
            Long senderUserId,
            String content
    ) {

        if (
            content == null ||
            content.trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Message cannot be empty."
            );
        }


        if (content.length() > 2000) {

            throw new IllegalArgumentException(
                    "Message cannot exceed 2000 characters."
            );
        }


        DiplomacyConversation conversation =
                conversationRepository
                        .findById(conversationId)
                        .orElseThrow(() ->
                            new IllegalArgumentException(
                                "Conversation not found."
                            )
                        );


        DebateSession session =
                conversation.getSession();


        Registration senderRegistration =
                requireActiveParticipant(
                        session,
                        senderUserId
                );


        /*
         * PRIVATE_GROUP:
         * sender must be a participant.
         */
        if (
            conversation.getType()
                == ConversationType.PRIVATE_GROUP
        ) {

            if (
                !conversation
                    .getParticipants()
                    .contains(senderRegistration)
            ) {

                throw new SecurityException(
                        "You are not a participant in this private conversation."
                );
            }
        }


        /*
         * PUBLIC_GROUP:
         * only selected participants can send.
         */
        if (
            conversation.getType()
                == ConversationType.PUBLIC_GROUP
        ) {

            if (
                !conversation
                    .getParticipants()
                    .contains(senderRegistration)
            ) {

                throw new SecurityException(
                        "You are not a participant in this group conversation."
                );
            }
        }


        User sender =
                userRepository
                        .findById(senderUserId)
                        .orElseThrow(() ->
                            new IllegalArgumentException(
                                "User not found."
                            )
                        );


        DiplomacyMessage message =
                new DiplomacyMessage();

        message.setConversation(
                conversation
        );

        message.setSender(sender);

        message.setContent(
                content.trim()
        );

DiplomacyMessage savedMessage =
        messageRepository.save(message);

Map<String, Object> payload =
        Map.of(
                "conversationId",
                savedMessage.getConversation().getId(),
                "messageId",
                savedMessage.getId()
        );

Set<Long> recipientUserIds =
        new HashSet<>();

/*
 * Sender should receive the event too.
 * This keeps multiple tabs/devices synchronized.
 */
recipientUserIds.add(senderUserId);

if (
        conversation.getType() ==
        ConversationType.PUBLIC_COUNCIL
) {

List<CommitteeDelegateDTO> participants =
        getSessionParticipants(
                session.getId(),
                senderUserId
        );
for (
        CommitteeDelegateDTO participant :
        participants
) {

    if (participant.getUserId() != null) {

        recipientUserIds.add(
                participant.getUserId()
        );
    }
}
}
else {

    for (
            Registration participant :
            conversation.getParticipants()
    ) {

        if (participant.getUser() != null) {

            recipientUserIds.add(
                    participant.getUser().getId()
            );
        }
    }
}

/*
 * PUBLIC_GROUP / PRIVATE_GROUP:
 * conversation participants receive the event.
 */
for (
        Registration participant :
        conversation.getParticipants()
) {

    if (participant.getUser() != null) {

        recipientUserIds.add(
                participant.getUser().getId()
        );
    }
}

/*
 * Chair has oversight access to every
 * diplomacy conversation.
 */
if (
        session.getChair() != null &&
        session.getChair().getId() != null
) {

    recipientUserIds.add(
            session.getChair().getId()
    );
}

/*
 * Send the event privately to each
 * authorized recipient.
 */
for (Long recipientUserId : recipientUserIds) {

    committeeEventPublisher.publishToUser(
            recipientUserId,
            session.getId(),
            "MESSAGE_SENT",
            senderUserId,
            payload
    );
}

return savedMessage;
    }


    /* =====================================================
       CHAIR OVERSIGHT
       ===================================================== */
@Override
@Transactional(readOnly = true)
public List<DiplomacyConversation>
getAllConversationsForChair(
        Long sessionId,
        Long chairUserId
) {

    DebateSession session =
            getActiveSession(sessionId);

    validateChair(
            session,
            chairUserId
    );

    List<DiplomacyConversation> conversations =
            conversationRepository
                    .findBySessionOrderByCreatedAtAsc(
                            session
                    );

    System.out.println(
        "CHAIR OVERSIGHT SESSION ID = "
        + session.getId()
    );

    System.out.println(
        "CHAIR OVERSIGHT CONVERSATIONS = "
        + conversations.size()
    );

    for (DiplomacyConversation conversation : conversations) {

        System.out.println(
            "Conversation ID = "
            + conversation.getId()
            + ", Session ID = "
            + (
                conversation.getSession() != null
                    ? conversation.getSession().getId()
                    : null
            )
            + ", Type = "
            + conversation.getType()
        );
    }

    return conversations;
}

@Override
@Transactional(readOnly = true)
public List<DiplomacyMessage> getMessagesForChair(
        Long conversationId,
        Long chairUserId
) {

    DiplomacyConversation conversation =
            conversationRepository
                    .findById(conversationId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Conversation not found."
                            )
                    );

    DebateSession session =
            getActiveSession(
                    conversation
                            .getSession()
                            .getId()
            );

    validateChair(
            session,
            chairUserId
    );

    return messageRepository
            .findByConversationOrderByCreatedAtAsc(
                    conversation
            );
}
    /* =====================================================
       ACTIVE SESSION
       ===================================================== */

    private DebateSession
    getActiveSession(
            Long sessionId
    ) {

        DebateSession session =
                sessionRepository
                        .findById(sessionId)
                        .orElseThrow(() ->
                            new IllegalArgumentException(
                                "Debate session not found."
                            )
                        );


        if (
            !Boolean.TRUE.equals(
                session.getActive()
            )
        ) {

            throw new IllegalStateException(
                    "Diplomacy is only available during an active session."
            );
        }


        return session;
    }


    /* =====================================================
       PARTICIPANT AUTHORIZATION
       ===================================================== */

private Registration
requireActiveParticipant(
        DebateSession session,
        Long userId
) {

    List<Registration> registrations =
            registrationRepository
                    .findByCommittee_Id(
                            session
                                .getCommittee()
                                .getId()
                    );

    return registrations
            .stream()
            .filter(r ->
                r.getUser() != null &&
                r.getUser().getId().equals(userId)
            )
.filter(r ->
    r.getWorkflowStatus() == RegistrationStatus.ACTIVE
)
            .findFirst()
            .orElseThrow(() ->
                new SecurityException(
                    "You are not an active participant in this committee."
                )
            );
}

    /* =====================================================
       REGISTRATION VALIDATION
       ===================================================== */

    private void
    validateRegistrationBelongsToSession(
            Registration registration,
            DebateSession session
    ) {

        if (
            registration.getCommittee() == null ||
            session.getCommittee() == null ||
            !Objects.equals(
                registration
                    .getCommittee()
                    .getId(),

                session
                    .getCommittee()
                    .getId()
            )
        ) {

            throw new SecurityException(
                    "Participant does not belong to this committee."
            );
        }


if (
    registration.getWorkflowStatus() != RegistrationStatus.ACTIVE
) {

            throw new SecurityException(
                    "Participant is not active."
            );
        }
    }


    /* =====================================================
       CONVERSATION READ AUTHORIZATION
       ===================================================== */

    private void authorizeConversationRead(
        DiplomacyConversation conversation,
        Long userId
) {

    DebateSession session =
            conversation.getSession();

    /*
     * Chair has oversight access to every conversation.
     *
     * This check MUST happen before requireActiveParticipant()
     * because the chair is not required to have a delegate
     * registration.
     */
    if (
            session.getChair() != null &&
            Objects.equals(
                    session.getChair().getId(),
                    userId
            )
    ) {
        return;
    }

    /*
     * Everyone else must be an active delegate.
     */
    Registration registration =
            requireActiveParticipant(
                    session,
                    userId
            );

    /*
     * Public conversations are readable by
     * every active delegate.
     */
    if (
            conversation.getType()
                    == ConversationType.PUBLIC_COUNCIL
            ||
            conversation.getType()
                    == ConversationType.PUBLIC_GROUP
    ) {
        return;
    }

    /*
     * PRIVATE_GROUP:
     * only selected participants can read it.
     */
    if (
            conversation.getParticipants()
                    .contains(registration)
    ) {
        return;
    }

    throw new SecurityException(
            "You do not have access to this private conversation."
    );
}   
    /* =====================================================
       CHAIR VALIDATION
       ===================================================== */

    private void validateChair(
            DebateSession session,
            Long userId
    ) {

        if (
            session.getChair() == null ||
            session
                .getChair()
                .getId()
                .longValue() != userId.longValue()
        ) {

            throw new SecurityException(
                    "Only the committee chair can access diplomacy oversight."
            );
        }
    }

}