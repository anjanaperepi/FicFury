package com.ficfury.debate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

@Modifying
@Query("DELETE FROM Vote v WHERE v.session.id = :sessionId")
void deleteBySessionId(@Param("sessionId") Long sessionId);

@Modifying
@Query("DELETE FROM Vote v WHERE v.resolution.id = :resolutionId")
void deleteByResolutionId(@Param("resolutionId") Long resolutionId);

}
