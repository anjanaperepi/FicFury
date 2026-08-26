package com.ficfury.debate.dto.response;

import com.ficfury.debate.enums.ConversationType;

import java.time.LocalDateTime;
import java.util.List;

public record DiplomacyConversationDTO(
        Long id,
        DiplomacySessionDTO session,
        ConversationType type,
        List<DiplomacyParticipantDTO> participants,
        LocalDateTime createdAt
) {
}