package com.ficfury.debate.service;

import com.ficfury.debate.dto.response.ActivityLogResponse;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.ActivityType;
import com.ficfury.model.User;
import java.util.List;

public interface ActivityLogService {

    void log(
            DebateSession session,
            User user,
            ActivityType activityType,
            String title,
            String description
    );

    List<ActivityLogResponse> getTimeline(Long sessionId);

}
