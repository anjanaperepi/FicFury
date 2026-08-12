package com.ficfury.debate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.debate.entity.SpeakerQueue;
import com.ficfury.debate.enums.SpeakerStatus;

public interface SpeakerQueueRepository
        extends JpaRepository<SpeakerQueue, Long> {

    List<SpeakerQueue> findBySessionIdOrderByQueuePosition(
            Long sessionId);

    List<SpeakerQueue> findBySessionIdAndStatusOrderByQueuePosition(
            Long sessionId,
            SpeakerStatus status);

    Optional<SpeakerQueue> findBySessionIdAndStatus(
            Long sessionId,
            SpeakerStatus status);

    long countBySessionId(Long sessionId);
}