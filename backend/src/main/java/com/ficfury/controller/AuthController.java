package com.ficfury.controller;

import com.ficfury.dto.AuthResponse;
import com.ficfury.dto.LoginRequest;
import com.ficfury.dto.RegisterRequest;
import com.ficfury.service.AuthService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }

   @PostMapping("/register")
public AuthResponse register(
        @RequestBody RegisterRequest request
) {

    String message =
            authService.register(
                    request
            );

   return new AuthResponse(
        null,
        null,
        null,
        message,
        null
);

}

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request
    ) {

        return authService.login(
                request
        );

    }

}