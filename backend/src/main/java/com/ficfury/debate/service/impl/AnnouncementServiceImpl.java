package com.ficfury.debate.service.impl;

import com.ficfury.debate.dto.request.AnnouncementRequest;
import com.ficfury.debate.dto.response.AnnouncementResponse;
import com.ficfury.debate.entity.Announcement;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.repository.AnnouncementRepository;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.debate.service.AnnouncementService;
import com.ficfury.model.User;
import com.ficfury.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementServiceImpl
        implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final DebateSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public AnnouncementServiceImpl(
            AnnouncementRepository announcementRepository,
            DebateSessionRepository sessionRepository,
            UserRepository userRepository) {

        this.announcementRepository = announcementRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Override
public AnnouncementResponse publishAnnouncement(
        AnnouncementRequest request) {

    DebateSession session =
            sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Session not found."));

    User chair =
            userRepository.findById(request.getChairId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Chair not found."));

    Announcement announcement = new Announcement();

    announcement.setSession(session);

    announcement.setChair(chair);

    announcement.setTitle(request.getTitle());

    announcement.setMessage(request.getMessage());

    announcement.setPinned(request.getPinned());

    announcement.setCreatedAt(LocalDateTime.now());

    Announcement saved =
            announcementRepository.save(announcement);

    AnnouncementResponse response =
            new AnnouncementResponse();

    response.setId(saved.getId());

    response.setTitle(saved.getTitle());

    response.setMessage(saved.getMessage());

    response.setPinned(saved.getPinned());

    response.setChairName(
            saved.getChair().getFullName());

    response.setCreatedAt(
            saved.getCreatedAt());

    return response;

}
@Override
public List<AnnouncementResponse> getAnnouncements(
        Long sessionId) {

    DebateSession session =
            sessionRepository.findById(sessionId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Session not found."));

    return announcementRepository
            .findBySessionOrderByCreatedAtDesc(session)
            .stream()
            .map(a -> {

                AnnouncementResponse response =
                        new AnnouncementResponse();

                response.setId(a.getId());

                response.setTitle(a.getTitle());

                response.setMessage(a.getMessage());

                response.setPinned(a.getPinned());

                response.setChairName(
                        a.getChair().getFullName());

                response.setCreatedAt(
                        a.getCreatedAt());

                return response;

            })
            .toList();

}
        }