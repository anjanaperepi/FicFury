package com.ficfury.debate.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ficfury.debate.dto.request.CastVoteRequest;
import com.ficfury.debate.dto.response.VoteResponse;
import com.ficfury.debate.dto.response.VoteResultResponse;
import com.ficfury.debate.service.VoteService;

@RestController
@RequestMapping("/api/debate/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public ResponseEntity<VoteResponse> castVote(
            @RequestBody CastVoteRequest request) {

        return ResponseEntity.ok(
                voteService.castVote(request));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<VoteResponse>> getVotes(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                voteService.getVotes(sessionId));
    }

    @GetMapping("/session/{sessionId}/result")
    public ResponseEntity<VoteResultResponse> getVotingResult(
            @PathVariable Long sessionId,
            @PathVariable Long delegateId) {

        return ResponseEntity.ok(
                voteService.getVotingResult(sessionId, delegateId));
    }

@GetMapping("/results/{resolutionId}/{delegateId}")
public ResponseEntity<VoteResultResponse> getVotingResults(
        @PathVariable Long resolutionId,
        @PathVariable Long delegateId) {

    return ResponseEntity.ok(
            voteService.getVotingResult(
                    resolutionId,
                    delegateId));
}
}



