package com.ficfury.debate.repository;

import com.ficfury.debate.entity.ActivityLog;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findBySessionOrderByCreatedAtDesc(
            DebateSession session
    );

    List<ActivityLog> findByActivityType(
            ActivityType activityType
    );

}
