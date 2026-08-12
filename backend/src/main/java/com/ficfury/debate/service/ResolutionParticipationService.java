package com.ficfury.debate.service;

import java.util.List;

import com.ficfury.debate.dto.request.AddSignatoryRequest;
import com.ficfury.debate.dto.request.AddSponsorRequest;
import com.ficfury.debate.dto.response.SignatoryResponse;
import com.ficfury.debate.dto.response.SponsorResponse;

public interface ResolutionParticipationService {

    SponsorResponse addSponsor(
            AddSponsorRequest request);

    SignatoryResponse addSignatory(
            AddSignatoryRequest request);

    List<SponsorResponse> getSponsors(
            Long resolutionId);

    List<SignatoryResponse> getSignatories(
            Long resolutionId);

    void removeSponsor(
            Long sponsorId);

    void removeSignatory(
            Long signatoryId);

}