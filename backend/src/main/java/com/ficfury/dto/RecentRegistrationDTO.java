package com.ficfury.dto;

import java.time.LocalDateTime;

public class RecentRegistrationDTO {

    private Long id;

    private String delegateName;

    private String committeeName;

    private String characterName;

    private String status;

    private LocalDateTime registeredAt;

    public RecentRegistrationDTO() {
    }

    public RecentRegistrationDTO(
            Long id,
            String delegateName,
            String committeeName,
            String characterName,
            String status,
            LocalDateTime registeredAt
    ) {
        this.id = id;
        this.delegateName = delegateName;
        this.committeeName = committeeName;
        this.characterName = characterName;
        this.status = status;
        this.registeredAt = registeredAt;
    }

    // ==========================
    // Getters
    // ==========================

    public Long getId() {
        return id;
    }

    public String getDelegateName() {
        return delegateName;
    }

    public String getCommitteeName() {
        return committeeName;
    }

    public String getCharacterName() {
        return characterName;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    // ==========================
    // Setters
    // ==========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setDelegateName(String delegateName) {
        this.delegateName = delegateName;
    }

    public void setCommitteeName(String committeeName) {
        this.committeeName = committeeName;
    }

    public void setCharacterName(String characterName) {
        this.characterName = characterName;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

}