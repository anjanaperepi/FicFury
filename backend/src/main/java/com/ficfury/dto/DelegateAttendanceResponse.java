package com.ficfury.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DelegateAttendanceResponse {

    private Long registrationId;

    private Long userId;

    private String delegateName;

    private String delegateEmail;

    private String characterName;

}