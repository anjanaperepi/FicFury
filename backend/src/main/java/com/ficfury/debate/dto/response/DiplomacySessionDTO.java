package com.ficfury.debate.dto.response;

public record DiplomacySessionDTO(
        Long id,
        Long committeeId,
        String committeeName,
        Long chairId,
        String chairName
) {}