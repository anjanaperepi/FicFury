package com.ficfury.debate.service.impl;

import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.SessionStatus;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.debate.service.DebateSessionService;
import org.springframework.stereotype.Service;
import com.ficfury.debate.dto.request.CreateDebateSessionRequest;
import com.ficfury.debate.dto.response.DebateSessionResponse;
import com.ficfury.debate.mapper.DebateMapper;
import com.ficfury.debate.dto.request.ActiveSessionResponse;

import com.ficfury.repository.CommitteeRepository;
import com.ficfury.repository.UserRepository;

import com.ficfury.model.Committee;
import com.ficfury.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DebateSessionServiceImpl implements DebateSessionService {

    private final DebateSessionRepository sessionRepository;
    private final CommitteeRepository committeeRepository;
    private final UserRepository userRepository;
    private final DebateMapper debateMapper;

    public DebateSessionServiceImpl(
            DebateSessionRepository sessionRepository,
            CommitteeRepository committeeRepository,
            UserRepository userRepository,
            DebateMapper debateMapper) {

        this.sessionRepository = sessionRepository;
        this.committeeRepository = committeeRepository;
        this.userRepository = userRepository;
        this.debateMapper = debateMapper;
    }



@Override
public DebateSessionResponse createSession(CreateDebateSessionRequest request) {

    System.out.println("Service reached");

    Committee committee = committeeRepository.findById(request.getCommitteeId())
            .orElseThrow(() -> new RuntimeException("Committee not found."));

    User chair = userRepository.findById(request.getChairId())
            .orElseThrow(() -> new RuntimeException("Chair not found."));

System.out.println("================================");
System.out.println("Request Chair ID : " + request.getChairId());
System.out.println("Loaded Chair ID  : " + chair.getId());
System.out.println("Chair Email      : " + chair.getEmail());
System.out.println("================================");
    Optional<DebateSession> existingSession =
        sessionRepository.findFirstByChair_IdAndStatusIn(
                chair.getId(),
                List.of(
                        SessionStatus.DRAFT,
                        SessionStatus.INITIATED,
                        SessionStatus.ACTIVE
                )
        );
System.out.println("Existing session found: " + existingSession.isPresent());

existingSession.ifPresent(session -> {
    System.out.println("Session ID   : " + session.getId());
    System.out.println("Chair ID     : " + session.getChair().getId());
    System.out.println("Status       : " + session.getStatus());
});
if (existingSession.isPresent()) {

    throw new IllegalStateException(
            "An unfinished debate session already exists for this chair."
    );

}
    DebateSession session = new DebateSession();

    session.setCommittee(committee);
    session.setChair(chair);
    session.setStatus(SessionStatus.DRAFT);
    session.setActive(false);
    session.setCreatedAt(LocalDateTime.now());

    DebateSession savedSession = sessionRepository.save(session);
    System.out.println("About to return response");
    return debateMapper.toDebateSessionResponse(savedSession);
}

@Override
public DebateSessionResponse initiateSession(Long sessionId) {

    DebateSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() ->
                    new RuntimeException("Debate session not found."));

    if (session.getStatus() != SessionStatus.DRAFT) {
        throw new IllegalStateException(
                "Only draft sessions can be initiated."
        );
    }

    session.setStatus(SessionStatus.INITIATED);

    session.setInitiatedAt(LocalDateTime.now());

DebateSession savedSession = sessionRepository.save(session);

return debateMapper.toDebateSessionResponse(savedSession);
}


@Override
public DebateSessionResponse getChairSession(Long chairId) {

    DebateSession session = sessionRepository
            .findTopByChair_IdOrderByCreatedAtDesc(chairId)
            .orElseThrow(() ->
                    new RuntimeException("No debate session found."));

    return debateMapper.toDebateSessionResponse(session);

}

@Override
@Transactional
public DebateSessionResponse activateSession(Long sessionId) {

    DebateSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() ->
                    new RuntimeException("Debate session not found."));

    if (session.getStatus() != SessionStatus.INITIATED) {
        throw new IllegalStateException(
                "Only initiated sessions can be activated."
        );
    }

Optional<DebateSession> currentActiveSession =
        sessionRepository.findByCommitteeAndActiveTrue(
                session.getCommittee());

if (currentActiveSession.isPresent()
        && !currentActiveSession.get().getId().equals(session.getId())) {

    DebateSession activeSession = currentActiveSession.get();

    activeSession.setActive(false);

    activeSession.setStatus(SessionStatus.STOPPED);

    activeSession.setEndedAt(LocalDateTime.now());

    sessionRepository.save(activeSession);
}

session.setStatus(SessionStatus.ACTIVE);

session.setActive(true);

session.setActivatedAt(LocalDateTime.now());

DebateSession savedSession = sessionRepository.save(session);

return debateMapper.toDebateSessionResponse(savedSession);
}

@Override
public DebateSessionResponse stopSession(Long sessionId) {

    DebateSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() ->
                    new RuntimeException("Debate session not found."));

    if (session.getStatus() != SessionStatus.ACTIVE) {
        throw new IllegalStateException(
                "Only active sessions can be stopped."
        );
    }

    session.setStatus(SessionStatus.STOPPED);

    session.setActive(false);

    session.setEndedAt(LocalDateTime.now());

DebateSession savedSession = sessionRepository.save(session);

return debateMapper.toDebateSessionResponse(savedSession);
}

@Override
public DebateSessionResponse archiveSession(Long sessionId) {

    DebateSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() ->
                    new RuntimeException("Debate session not found."));

    if (session.getStatus() != SessionStatus.STOPPED) {
        throw new IllegalStateException(
                "Only stopped sessions can be archived."
        );
    }

    session.setStatus(SessionStatus.ARCHIVED);

    session.setArchivedAt(LocalDateTime.now());

DebateSession savedSession = sessionRepository.save(session);

return debateMapper.toDebateSessionResponse(savedSession);
}

@Override
public Optional<DebateSessionResponse> getSession(Long sessionId) {

    return sessionRepository.findById(sessionId)
            .map(debateMapper::toDebateSessionResponse);
}

@Override
public List<DebateSessionResponse> getAllSessions() {

    return sessionRepository.findAll()
            .stream()
            .map(debateMapper::toDebateSessionResponse)
            .toList();
}

@Override
public List<DebateSessionResponse> getSessionsByStatus(
        SessionStatus status) {

    return sessionRepository.findByStatus(status)
            .stream()
            .map(debateMapper::toDebateSessionResponse)
            .toList();
}
@Override
public ActiveSessionResponse getActiveSession(Long committeeId) {

    DebateSession session = sessionRepository
            .findByCommittee_IdAndActiveTrue(committeeId)
            .orElseThrow(() ->
                    new RuntimeException("No active debate session found."));

    ActiveSessionResponse response = new ActiveSessionResponse();

    response.setId(session.getId());

    response.setStatus(session.getStatus().name());

    response.setActive(session.getActive());

    response.setActivatedAt(session.getActivatedAt());

    response.setCommitteeId(session.getCommittee().getId());

    response.setCommitteeName(session.getCommittee().getName());

    response.setChairId(session.getChair().getId());

    response.setChairName(session.getChair().getFullName());

    return response;
}
}
