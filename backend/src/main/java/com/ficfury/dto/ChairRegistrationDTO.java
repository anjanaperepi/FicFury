package com.ficfury.dto;

import java.time.LocalDateTime;

public class ChairRegistrationDTO {

    private Long registrationId;

    private Long delegateId;

    private String delegateName;

    private String delegateEmail;

    private String characterName;

    private String committeeName;

    private String status;

    private LocalDateTime registeredAt;

    public ChairRegistrationDTO() {
    }

    public ChairRegistrationDTO(
            Long registrationId,
            Long delegateId,
            String delegateName,
            String delegateEmail,
            String characterName,
            String committeeName,
            String status,
            LocalDateTime registeredAt
    ) {
        this.registrationId = registrationId;
        this.delegateId = delegateId;
        this.delegateName = delegateName;
        this.delegateEmail = delegateEmail;
        this.characterName = characterName;
        this.committeeName = committeeName;
        this.status = status;
        this.registeredAt = registeredAt;
    }

    // =========================
    // Getters
    // =========================

    public Long getRegistrationId() {
        return registrationId;
    }

    public Long getDelegateId() {
        return delegateId;
    }

    public String getDelegateName() {
        return delegateName;
    }

    public String getDelegateEmail() {
        return delegateEmail;
    }

    public String getCharacterName() {
        return characterName;
    }

    public String getCommitteeName() {
        return committeeName;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    // =========================
    // Setters
    // =========================

    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }

    public void setDelegateId(Long delegateId) {
        this.delegateId = delegateId;
    }

    public void setDelegateName(String delegateName) {
        this.delegateName = delegateName;
    }

    public void setDelegateEmail(String delegateEmail) {
        this.delegateEmail = delegateEmail;
    }

    public void setCharacterName(String characterName) {
        this.characterName = characterName;
    }

    public void setCommitteeName(String committeeName) {
        this.committeeName = committeeName;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

}
