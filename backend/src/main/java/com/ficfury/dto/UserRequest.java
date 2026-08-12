package com.ficfury.dto;

import com.ficfury.model.Role;
import com.ficfury.model.UserStatus;

import lombok.Data;

@Data
public class UserRequest {

    private String fullName;

    private String username;

    private String email;

    private String password;

    private Role role;

    private UserStatus status;

}