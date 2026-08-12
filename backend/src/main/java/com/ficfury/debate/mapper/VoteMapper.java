package com.ficfury.debate.mapper;

import org.springframework.stereotype.Component;

import com.ficfury.debate.dto.response.VoteResponse;
import com.ficfury.debate.entity.Vote;

@Component
public class VoteMapper {

    public VoteResponse toVoteResponse(Vote vote) {

        VoteResponse response = new VoteResponse();

        response.setId(vote.getId());
        response.setSessionId(vote.getSession().getId());
        response.setDelegateId(vote.getDelegate().getId());
        response.setDelegateName(vote.getDelegate().getFullName());
        response.setVoteType(vote.getVoteType());
        response.setVotedAt(vote.getVotedAt());

        response.setResolutionId(
            vote.getResolution().getId());

        response.setResolutionTitle(
                vote.getResolution().getTitle());

        return response;
    }

}
