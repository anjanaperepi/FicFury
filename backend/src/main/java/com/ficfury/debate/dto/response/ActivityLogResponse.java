package com.ficfury.debate.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ActivityLogResponse {

    private Long id;

    private String activityType;

    private String title;

    private String description;

    private String userName;

    private String userRole;

    private LocalDateTime createdAt;

}