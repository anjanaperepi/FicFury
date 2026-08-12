package com.ficfury.util;

import org.springframework.stereotype.Component;

import com.ficfury.dto.UserResponse;
import com.ficfury.model.User;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {

        return UserResponse.builder()

                .id(user.getId())

                .fullName(user.getFullName())

                .username(user.getUsername())

                .email(user.getEmail())

                .role(user.getRole())

                .status(user.getStatus())

                .build();

    }

}