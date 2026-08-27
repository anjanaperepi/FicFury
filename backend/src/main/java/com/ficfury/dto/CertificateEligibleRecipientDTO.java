package com.ficfury.dto;

import com.ficfury.model.AwardType;

public class CertificateEligibleRecipientDTO {

    private Long userId;

    private String recipientName;

    private Long characterId;

    private String characterName;

    private Long committeeId;

    private String committeeName;

    private Long registrationId;

    private AwardType awardType;




    


    public CertificateEligibleRecipientDTO() {
    }


public CertificateEligibleRecipientDTO(
        Long userId,
        String recipientName,
        Long characterId,
        String characterName,
        Long committeeId,
        String committeeName,
        Long registrationId,
        AwardType awardType
) {

        this.userId = userId;
        this.recipientName = recipientName;
        this.characterId = characterId;
        this.characterName = characterName;
        this.committeeId = committeeId;
        this.committeeName = committeeName;
        this.registrationId = registrationId;
        this.awardType = awardType;
    }


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(
            String recipientName
    ) {
        this.recipientName = recipientName;
    }


    public Long getCharacterId() {
        return characterId;
    }

    public void setCharacterId(Long characterId) {
        this.characterId = characterId;
    }


    public String getCharacterName() {
        return characterName;
    }

    public void setCharacterName(
            String characterName
    ) {
        this.characterName = characterName;
    }


    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(Long committeeId) {
        this.committeeId = committeeId;
    }


    public String getCommitteeName() {
        return committeeName;
    }

    public void setCommitteeName(
            String committeeName
    ) {
        this.committeeName = committeeName;
    }


    public Long getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(
            Long registrationId
    ) {
        this.registrationId = registrationId;


    }


    public AwardType getAwardType() {
    return awardType;
}

public void setAwardType(AwardType awardType) {
    this.awardType = awardType;
}
}



