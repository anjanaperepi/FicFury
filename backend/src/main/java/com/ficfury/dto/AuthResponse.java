package com.ficfury.dto;

public class AuthResponse {

    private String token;
    private String role;
    private String fullName;
    private Long committeeId;
    private Long sessionId;
    private Long userId;

    public AuthResponse() {
    }

public AuthResponse(
        String token,
        Long userId,
        String role,
        String fullName,
        Long committeeId) {

    this.token = token;
    this.userId = userId;
    this.role = role;
    this.fullName = fullName;
    this.committeeId = committeeId;
}
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Long getCommitteeId() {
    return committeeId;
}

public void setCommitteeId(Long committeeId) {
    this.committeeId = committeeId;
}

public Long getUserId() {
    return userId;
}

public void setUserId(Long userId) {
    this.userId = userId;
}
}