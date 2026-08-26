package com.ficfury.debate.dto.response;

public record DiplomacyUserDTO(
        Long id,
        String fullName,
        String username,
        String email,
        String role
) {}
