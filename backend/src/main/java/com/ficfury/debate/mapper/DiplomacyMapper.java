package com.ficfury.debate.mapper;

import com.ficfury.debate.dto.response.DiplomacyConversationDTO;
import com.ficfury.debate.dto.response.DiplomacyMessageDTO;
import com.ficfury.debate.dto.response.DiplomacyParticipantDTO;
import com.ficfury.debate.dto.response.DiplomacySessionDTO;
import com.ficfury.debate.dto.response.DiplomacyUserDTO;

import com.ficfury.debate.entity.DiplomacyConversation;
import com.ficfury.debate.entity.DiplomacyMessage;

import com.ficfury.model.Registration;
import com.ficfury.model.User;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class DiplomacyMapper {


    public DiplomacyUserDTO toUserDTO(User user) {

        if (user == null) {
            return null;
        }

        return new DiplomacyUserDTO(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole() != null
                        ? user.getRole().name()
                        : null
        );
    }


    public DiplomacyParticipantDTO toParticipantDTO(
            Registration registration
    ) {

        if (registration == null) {
            return null;
        }

        return new DiplomacyParticipantDTO(
                registration.getId(),
                toUserDTO(registration.getUser())
        );
    }


    public DiplomacySessionDTO toSessionDTO(
            com.ficfury.debate.entity.DebateSession session
    ) {

        if (session == null) {
            return null;
        }

        return new DiplomacySessionDTO(
                session.getId(),
                session.getCommittee() != null
                        ? session.getCommittee().getId()
                        : null,
                session.getCommittee() != null
                        ? session.getCommittee().getName()
                        : null,
                session.getChair() != null
                        ? session.getChair().getId()
                        : null,
                session.getChair() != null
                        ? session.getChair().getFullName()
                        : null
        );
    }


    public DiplomacyConversationDTO toConversationDTO(
            DiplomacyConversation conversation
    ) {

        return new DiplomacyConversationDTO(
                conversation.getId(),
                toSessionDTO(conversation.getSession()),
                conversation.getType(),
                conversation.getParticipants()
                        .stream()
                        .map(this::toParticipantDTO)
                        .toList(),
                conversation.getCreatedAt()
        );
    }


    public List<DiplomacyConversationDTO>
    toConversationDTOs(
            List<DiplomacyConversation> conversations
    ) {

        return conversations
                .stream()
                .map(this::toConversationDTO)
                .toList();
    }


    public DiplomacyMessageDTO toMessageDTO(
            DiplomacyMessage message
    ) {

        return new DiplomacyMessageDTO(
                message.getId(),
                toUserDTO(message.getSender()),
                message.getContent(),
                message.getCreatedAt()
        );
    }


    public List<DiplomacyMessageDTO>
    toMessageDTOs(
            List<DiplomacyMessage> messages
    ) {

        return messages
                .stream()
                .map(this::toMessageDTO)
                .toList();
    }
}