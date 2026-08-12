package com.ficfury.debate.service.impl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ficfury.debate.dto.response.ActivityLogResponse;
import com.ficfury.debate.entity.ActivityLog;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.ActivityType;
import com.ficfury.debate.repository.ActivityLogRepository;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.debate.service.ActivityLogService;
import com.ficfury.model.User;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityLogServiceImpl
        implements ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private DebateSessionRepository debateSessionRepository;

    @Override
    public void log(
            DebateSession session,
            User user,
            ActivityType activityType,
            String title,
            String description) {
        System.out.println("===== ACTIVITY LOG =====");
        System.out.println("Type: " + activityType);
        System.out.println("Title: " + title);
        System.out.println("User: " + user.getEmail());
        System.out.println("========================");
        ActivityLog log = new ActivityLog();

        log.setSession(session);

        log.setUser(user);

        log.setUserRole(user.getRole());

        log.setActivityType(activityType);

        log.setTitle(title);

        log.setDescription(description);

        log.setCreatedAt(LocalDateTime.now());


        activityLogRepository.save(log);

    }

@Override
@Transactional(readOnly = true)
public List<ActivityLogResponse> getTimeline(Long sessionId) {

    DebateSession session =
            debateSessionRepository.findById(sessionId)
                    .orElseThrow(() ->
                            new RuntimeException("Session not found."));

    return activityLogRepository
            .findBySessionOrderByCreatedAtDesc(session)
            .stream()
            .map(log -> {

                ActivityLogResponse dto =
                        new ActivityLogResponse();

                dto.setId(log.getId());

                dto.setActivityType(
                        log.getActivityType().name());

                dto.setTitle(
                        log.getTitle());

                dto.setDescription(
                        log.getDescription());

                dto.setUserName(
                        log.getUser().getFullName());

                dto.setUserRole(
                        log.getUserRole().name());

                dto.setCreatedAt(
                        log.getCreatedAt());

                return dto;

            })
            .toList();

}

}