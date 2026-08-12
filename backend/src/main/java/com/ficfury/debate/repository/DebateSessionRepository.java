package com.ficfury.debate.repository;

import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.SessionStatus;
import com.ficfury.model.Committee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DebateSessionRepository extends JpaRepository<DebateSession, Long> {

    List<DebateSession> findByStatus(SessionStatus status);

    List<DebateSession> findByCommittee(Committee committee);

    Optional<DebateSession> findByCommitteeAndActiveTrue(Committee committee);

    Optional<DebateSession> findByCommittee_IdAndActiveTrue(Long committeeId);

    Optional<DebateSession> findTopByChair_IdOrderByCreatedAtDesc(Long chairId);

    Optional<DebateSession> findFirstByChair_IdAndStatusIn(
        Long chairId,
        List<SessionStatus> statuses
);  


    Optional<DebateSession>
        findTopByCommittee_IdOrderByCreatedAtDesc(
                Long committeeId
);


Optional<DebateSession>
findTopByCommittee_IdAndStatusOrderByCreatedAtDesc(
        Long committeeId,
        SessionStatus status
);
}
