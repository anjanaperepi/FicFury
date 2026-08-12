package com.ficfury.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.ficfury.dto.UserRequest;
import com.ficfury.dto.UserResponse;
import com.ficfury.util.UserMapper;
import com.ficfury.model.Role;
import com.ficfury.model.User;
import com.ficfury.model.UserStatus;
import com.ficfury.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final UserMapper userMapper;

    private final BCryptPasswordEncoder passwordEncoder;

    // =====================================================
    // GET ALL USERS
    // =====================================================

    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());

    }

    // =====================================================
    // GET USER BY ID
    // =====================================================

    public UserResponse getUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        return userMapper.toResponse(user);

    }

    // =====================================================
    // CREATE USER
    // =====================================================

    public UserResponse createUser(UserRequest request) {

        User user = new User();

        user.setFullName(request.getFullName());

        user.setUsername(request.getUsername());

        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(request.getRole());

        user.setStatus(request.getStatus());

        return userMapper.toResponse(

                userRepository.save(user)

        );

    }

    // =====================================================
    // UPDATE USER
    // =====================================================

    public UserResponse updateUser(
            Long id,
            UserRequest request
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        user.setFullName(request.getFullName());

        user.setUsername(request.getUsername());

        user.setEmail(request.getEmail());

        user.setRole(request.getRole());

        user.setStatus(request.getStatus());

        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPassword(

                    passwordEncoder.encode(

                            request.getPassword()

                    )

            );

        }

        return userMapper.toResponse(

                userRepository.save(user)

        );

    }

    // =====================================================
    // UPDATE ROLE
    // =====================================================

    public UserResponse updateRole(
            Long id,
            Role role
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        user.setRole(role);

        return userMapper.toResponse(

                userRepository.save(user)

        );

    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    public UserResponse updateStatus(
            Long id,
            UserStatus status
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        user.setStatus(status);

        return userMapper.toResponse(

                userRepository.save(user)

        );

    }

    // =====================================================
    // DELETE USER
    // =====================================================

    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        userRepository.delete(user);

    }

}