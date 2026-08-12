package com.ficfury.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.UserRequest;
import com.ficfury.dto.UserResponse;
import com.ficfury.dto.UserRoleRequest;
import com.ficfury.dto.UserStatusRequest;
import com.ficfury.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminUserController {

    private final UserService userService;

    // =====================================================
    // GET ALL USERS
    // =====================================================

    @GetMapping
    public List<UserResponse> getAllUsers() {

        return userService.getAllUsers();

    }

    // =====================================================
    // GET USER
    // =====================================================

    @GetMapping("/{id}")
    public UserResponse getUser(
            @PathVariable Long id
    ) {

        return userService.getUser(id);

    }

    // =====================================================
    // CREATE USER
    // =====================================================

    @PostMapping
    public UserResponse createUser(
            @RequestBody UserRequest request
    ) {

        return userService.createUser(request);

    }

    // =====================================================
    // UPDATE USER
    // =====================================================

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Long id,
            @RequestBody UserRequest request
    ) {

        return userService.updateUser(id, request);

    }

    // =====================================================
    // UPDATE ROLE
    // =====================================================

    @PatchMapping("/{id}/role")
    public UserResponse updateRole(
            @PathVariable Long id,
            @RequestBody UserRoleRequest request
    ) {

        return userService.updateRole(
                id,
                request.getRole()
        );

    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @PatchMapping("/{id}/status")
    public UserResponse updateStatus(
            @PathVariable Long id,
            @RequestBody UserStatusRequest request
    ) {

        return userService.updateStatus(
                id,
                request.getStatus()
        );

    }

    // =====================================================
    // DELETE USER
    // =====================================================

    @DeleteMapping("/{id}")
    public void deleteUser(
            @PathVariable Long id
    ) {

        userService.deleteUser(id);

    }

}