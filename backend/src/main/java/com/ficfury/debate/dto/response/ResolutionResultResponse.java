package com.ficfury.debate.dto.response;

import lombok.Data;

@Data
public class ResolutionResultResponse {

    private Long resolutionId;

    private String title;

    private String status;

    private long yesVotes;

    private long noVotes;

    private long abstainVotes;

    private long totalVotes;

    private long totalDelegates;

    private double participationPercentage;

    private long approvedAmendments;

    private long rejectedAmendments;

}
