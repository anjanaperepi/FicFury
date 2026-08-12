package com.ficfury.debate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.debate.entity.Motion;
import com.ficfury.debate.enums.MotionStatus;

public interface MotionRepository extends JpaRepository<Motion, Long> {

    List<Motion> findBySessionId(Long sessionId);

    List<Motion> findByStatus(MotionStatus status);

    List<Motion> findBySessionIdAndStatus(
            Long sessionId,
            MotionStatus status);

    List<Motion> findByDelegateId(Long delegateId);
}