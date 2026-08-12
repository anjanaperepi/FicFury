package com.ficfury.debate.mapper;

import org.springframework.stereotype.Component;

import com.ficfury.debate.dto.response.SignatoryResponse;
import com.ficfury.debate.dto.response.SponsorResponse;
import com.ficfury.debate.entity.ResolutionSignatory;
import com.ficfury.debate.entity.ResolutionSponsor;

@Component
public class ResolutionParticipationMapper {

    public SponsorResponse toSponsorResponse(
            ResolutionSponsor sponsor) {

        SponsorResponse response = new SponsorResponse();

        response.setId(sponsor.getId());

        response.setResolutionId(
                sponsor.getResolution().getId());

        response.setDelegateId(
                sponsor.getDelegate().getId());

        response.setDelegateName(
                sponsor.getDelegate().getFullName());

        response.setSponsoredAt(
                sponsor.getSponsoredAt());

        return response;
    }

    public SignatoryResponse toSignatoryResponse(
            ResolutionSignatory signatory) {

        SignatoryResponse response = new SignatoryResponse();

        response.setId(signatory.getId());

        response.setResolutionId(
                signatory.getResolution().getId());

        response.setDelegateId(
                signatory.getDelegate().getId());

        response.setDelegateName(
                signatory.getDelegate().getFullName());

        response.setSignedAt(
                signatory.getSignedAt());

        return response;
    }

}