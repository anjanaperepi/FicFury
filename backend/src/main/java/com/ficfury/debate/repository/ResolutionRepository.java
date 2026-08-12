package com.ficfury.debate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.debate.entity.Resolution;
import com.ficfury.debate.entity.ResolutionStatus;

public interface ResolutionRepository extends JpaRepository<Resolution, Long> {

    List<Resolution> findBySessionId(Long sessionId);

    List<Resolution> findBySessionIdAndStatus(
            Long sessionId,
            ResolutionStatus status);

    List<Resolution> findBySubmittedById(Long delegateId);

}
