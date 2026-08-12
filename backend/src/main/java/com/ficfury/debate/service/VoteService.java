package com.ficfury.debate.service;

import java.util.List;

import com.ficfury.debate.dto.request.CastVoteRequest;
import com.ficfury.debate.dto.response.VoteResponse;
import com.ficfury.debate.dto.response.VoteResultResponse;

public interface VoteService {

    VoteResponse castVote(CastVoteRequest request);

    List<VoteResponse> getVotes(Long sessionId);

    VoteResultResponse getVotingResult(
        Long resolutionId,
        Long delegateId);

    

}
