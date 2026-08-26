package com.ficfury.debate.dto.request;

import java.util.List;

public record CreateConversationRequest(
        String type,
        List<Long> participantRegistrationIds
) {
}