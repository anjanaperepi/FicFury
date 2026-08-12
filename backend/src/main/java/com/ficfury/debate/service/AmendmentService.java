package com.ficfury.debate.service;

import java.util.List;

import com.ficfury.debate.dto.request.CreateAmendmentRequest;
import com.ficfury.debate.dto.response.AmendmentResponse;

public interface AmendmentService {

    AmendmentResponse createAmendment(
            CreateAmendmentRequest request);

    AmendmentResponse approveAmendment(
            Long amendmentId);

    AmendmentResponse rejectAmendment(
            Long amendmentId);

    List<AmendmentResponse> getResolutionAmendments(
            Long resolutionId);

    List<AmendmentResponse> getPendingAmendments(
            Long resolutionId);

}