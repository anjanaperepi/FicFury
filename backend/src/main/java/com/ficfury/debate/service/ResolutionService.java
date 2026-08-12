package com.ficfury.debate.service;

import java.util.List;

import com.ficfury.debate.dto.request.CreateResolutionRequest;
import com.ficfury.debate.dto.request.UpdateResolutionRequest;
import com.ficfury.debate.dto.response.ResolutionResponse;
import com.ficfury.debate.dto.response.ResolutionResultResponse;

public interface ResolutionService {



    ResolutionResponse submitResolution(Long resolutionId);



ResolutionResponse markPassed(Long resolutionId);

ResolutionResponse markFailed(Long resolutionId);
    ResolutionResponse createResolution(
            CreateResolutionRequest request);

    ResolutionResponse updateResolution(
            Long resolutionId,
            UpdateResolutionRequest request);

    ResolutionResponse approveResolution(
            Long resolutionId);

    ResolutionResponse rejectResolution(
            Long resolutionId);

    void deleteResolution(Long resolutionId);

    ResolutionResponse getResolution(
            Long resolutionId);

    List<ResolutionResponse> getSessionResolutions(
            Long sessionId);

    List<ResolutionResponse> getApprovedResolutions(
            Long sessionId);
    ResolutionResponse openVoting(Long resolutionId);
    ResolutionResponse closeVoting(Long resolutionId);
    ResolutionResponse openAmendments(Long resolutionId);

ResolutionResponse closeAmendments(Long resolutionId);


ResolutionResultResponse getResults(Long resolutionId);
}