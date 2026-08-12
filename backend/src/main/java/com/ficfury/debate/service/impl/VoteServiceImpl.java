package com.ficfury.debate.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ficfury.debate.dto.request.CastVoteRequest;
import com.ficfury.debate.dto.response.VoteResponse;
import com.ficfury.debate.dto.response.VoteResultResponse;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.entity.ResolutionStatus;
import com.ficfury.debate.entity.Resolution;
import com.ficfury.debate.entity.Vote;
import com.ficfury.debate.entity.VoteType;
import com.ficfury.debate.mapper.VoteMapper;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.debate.repository.ResolutionRepository;
import com.ficfury.debate.repository.VoteRepository;
import com.ficfury.model.User;
import com.ficfury.repository.UserRepository;

import com.ficfury.debate.service.VoteService;
import com.ficfury.debate.enums.SessionStatus;
import java.util.Optional;

@Service
public class VoteServiceImpl implements VoteService {

    private final VoteRepository voteRepository;
    private final DebateSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final VoteMapper voteMapper;
    private final ResolutionRepository resolutionRepository;

    public VoteServiceImpl(
            VoteRepository voteRepository,
            DebateSessionRepository sessionRepository,
            UserRepository userRepository,
            VoteMapper voteMapper,
            ResolutionRepository resolutionRepository) {

        this.voteRepository = voteRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.voteMapper = voteMapper;
        this.resolutionRepository = resolutionRepository;
    }

    @Override
    public VoteResponse castVote(CastVoteRequest request) {


        Resolution resolution =
        resolutionRepository.findById(
                request.getResolutionId())
        .orElseThrow(() ->
                new RuntimeException("Resolution not found."));

        if (resolution.getStatus() != ResolutionStatus.VOTING) {
    throw new IllegalStateException(
            "Voting has not been opened for this resolution.");
}
        DebateSession session = sessionRepository.findById(
                request.getSessionId())
                .orElseThrow(() ->
                        new RuntimeException("Session not found."));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Voting is allowed only in active sessions.");
        }

        User delegate = userRepository.findById(
                request.getDelegateId())
                .orElseThrow(() ->
                        new RuntimeException("Delegate not found."));

        if (voteRepository.findByResolutionIdAndDelegateId(
                request.getResolutionId(),
                delegate.getId()).isPresent()) {

            throw new IllegalStateException(
                    "Delegate has already voted.");
        }



        
        Vote vote = new Vote();
        vote.setResolution(resolution);
        vote.setSession(session);
        vote.setDelegate(delegate);
        vote.setVoteType(request.getVoteType());
        vote.setVotedAt(LocalDateTime.now());

        Vote savedVote = voteRepository.save(vote);

        return voteMapper.toVoteResponse(savedVote);
    }

    @Override
    public List<VoteResponse> getVotes(Long resolutionId) {

        return voteRepository.findByResolutionId(resolutionId)
                .stream()
                .map(voteMapper::toVoteResponse)
                .toList();
    }

    @Override
    public VoteResultResponse getVotingResult(Long resolutionId , Long delegateId) {

        long yes =
                voteRepository.countByResolutionIdAndVoteType(
                        resolutionId,
                        VoteType.YES);

        long no =
                voteRepository.countByResolutionIdAndVoteType(
                        resolutionId,
                        VoteType.NO);



        VoteResultResponse result = new VoteResultResponse();

        result.setYesVotes(yes);
        result.setNoVotes(no);

        result.setTotalVotes(yes + no );

        result.setPassed(yes > no);
        Optional<Vote> delegateVote =
        voteRepository.findByResolutionIdAndDelegateId(
                resolutionId,
                delegateId);

        result.setHasVoted(delegateVote.isPresent());

        delegateVote.ifPresent(vote ->
                result.setCurrentUserVote(vote.getVoteType()));

        return result;
    }



}