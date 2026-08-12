package com.ficfury.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommitteeDelegateDTO {

    private Long registrationId;

    private Long userId;

    private String delegateName;

    private String email;

    private String characterName;

    private String committeeName;

    private String workflowStatus;

    private LocalDateTime registeredAt;
}