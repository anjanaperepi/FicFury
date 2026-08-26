package com.ficfury.debate.dto.response;

import java.time.LocalDateTime;

public record DiplomacyMessageDTO(
        Long id,
        DiplomacyUserDTO sender,
        String content,
        LocalDateTime createdAt
) {}