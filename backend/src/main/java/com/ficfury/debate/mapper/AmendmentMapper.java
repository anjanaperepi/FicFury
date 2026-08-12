package com.ficfury.debate.mapper;

import org.springframework.stereotype.Component;

import com.ficfury.debate.dto.response.AmendmentResponse;
import com.ficfury.debate.entity.Amendment;



@Component
public class AmendmentMapper {

    public AmendmentResponse toResponse(Amendment amendment) {

        AmendmentResponse response = new AmendmentResponse();

        response.setId(amendment.getId());
        response.setResolutionId(amendment.getResolution().getId());
        response.setDelegateId(amendment.getProposedBy().getId());
        response.setDelegateName(amendment.getProposedBy().getFullName());
        response.setAmendmentType(amendment.getAmendmentType());

        response.setClauseId(
                amendment.getClause().getId());

        response.setClauseNumber(
                amendment.getClause().getClauseNumber());

        response.setCurrentContent(
                amendment.getClause().getContent());

        response.setProposedText(
                amendment.getProposedText());

        response.setStatus(amendment.getStatus());
        response.setProposedAt(amendment.getProposedAt());
        response.setReviewedAt(amendment.getReviewedAt());

        return response;
    }
}