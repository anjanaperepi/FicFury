package com.ficfury.dto;

public class RegistrationRequest {

    

    private Long committeeId;

    private Long characterId;

    public RegistrationRequest() {
    }



    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(
            Long committeeId
    ) {
        this.committeeId = committeeId;
    }

    public Long getCharacterId() {
        return characterId;
    }

    public void setCharacterId(
            Long characterId
    ) {
        this.characterId = characterId;
    }

}