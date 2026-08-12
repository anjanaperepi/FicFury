package com.ficfury.dto;

import com.ficfury.model.Role;
import com.ficfury.model.UserStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private Long id;

    private String fullName;

    private String username;

    private String email;

    private Role role;

    private UserStatus status;

}