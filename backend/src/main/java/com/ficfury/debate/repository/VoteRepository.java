package com.ficfury.debate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.debate.entity.Vote;
import com.ficfury.debate.entity.VoteType;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    List<Vote> findBySessionId(Long sessionId);

    List<Vote> findByResolutionId(Long resolutionId);

Optional<Vote> findByResolutionIdAndDelegateId(
        Long resolutionId,
        Long delegateId);

long countByResolutionIdAndVoteType(
        Long resolutionId,
        VoteType voteType);

}
