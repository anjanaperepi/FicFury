package com.ficfury.dto;

public class CharacterChangeRequestDTO {

    private Long requestedCharacterId;

    private String reason;


    public Long getRequestedCharacterId() {
        return requestedCharacterId;
    }


    public void setRequestedCharacterId(
        Long requestedCharacterId
    ) {

        this.requestedCharacterId =
            requestedCharacterId;

    }


    public String getReason() {
        return reason;
    }


    public void setReason(String reason) {
        this.reason = reason;
    }

}