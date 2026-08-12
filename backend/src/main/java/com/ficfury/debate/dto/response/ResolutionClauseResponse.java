package com.ficfury.debate.dto.response;

import com.ficfury.debate.entity.ClauseType;

import lombok.Data;

@Data
public class ResolutionClauseResponse {

    private Long id;

    private Integer clauseNumber;

    private ClauseType clauseType;

    private String content;

}