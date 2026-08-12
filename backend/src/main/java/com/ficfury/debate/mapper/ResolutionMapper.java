package com.ficfury.debate.mapper;

import org.springframework.stereotype.Component;

import com.ficfury.debate.dto.response.ResolutionResponse;
import com.ficfury.debate.entity.Resolution;

import lombok.RequiredArgsConstructor;

import com.ficfury.debate.repository.ResolutionSponsorRepository;
import com.ficfury.debate.repository.ResolutionSignatoryRepository;

@Component
@RequiredArgsConstructor
public class ResolutionMapper {

    private final ResolutionSponsorRepository sponsorRepository;

    private final ResolutionSignatoryRepository signatoryRepository;

    public ResolutionResponse toResponse(Resolution resolution) {

        ResolutionResponse response = new ResolutionResponse();

        response.setId(resolution.getId());

        response.setSessionId(
                resolution.getSession().getId());

        response.setSubmittedById(
                resolution.getSubmittedBy().getId());

        response.setSubmittedByName(
                resolution.getSubmittedBy().getFullName());

        response.setTitle(resolution.getTitle());

        response.setContent(resolution.getContent());

        response.setStatus(resolution.getStatus());

        response.setSponsorCount(
        sponsorRepository.countByResolution_Id(
                resolution.getId()
        )
);

response.setSignatoryCount(
        signatoryRepository.countByResolution_Id(
                resolution.getId()
        )
);

response.setRequiredSponsors(
        resolution.getSession().getRequiredSponsors()
);

response.setRequiredSignatories(
        resolution.getSession().getRequiredSignatories()
);

response.setSubmittedAt(
        resolution.getSubmittedAt());

response.setReviewedAt(
        resolution.getReviewedAt());

        return response;


    }

}