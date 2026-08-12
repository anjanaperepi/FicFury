package com.ficfury.debate.service;

import java.util.List;

import com.ficfury.debate.dto.response.ResolutionClauseResponse;

public interface ResolutionClauseService {

        List<ResolutionClauseResponse> getClauses(
            Long resolutionId);

    ResolutionClauseResponse getClause(
            Long clauseId);

    List<ResolutionClauseResponse> regenerateClauses(
            Long resolutionId);

    void deleteClauses(
            Long resolutionId);


}
