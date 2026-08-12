package com.ficfury.debate.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ficfury.debate.dto.request.AddSpeakerRequest;
import com.ficfury.debate.dto.response.SpeakerResponse;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.entity.SpeakerQueue;
import com.ficfury.debate.enums.SessionStatus;
import com.ficfury.debate.enums.SpeakerStatus;
import com.ficfury.debate.mapper.SpeakerMapper;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.debate.repository.SpeakerQueueRepository;
import com.ficfury.debate.service.SpeakerQueueService;
import com.ficfury.model.User;
import com.ficfury.repository.UserRepository;
import java.time.Duration;

@Service
public class SpeakerQueueServiceImpl implements SpeakerQueueService {

    private final SpeakerQueueRepository speakerQueueRepository;

    private final DebateSessionRepository sessionRepository;

    private final UserRepository userRepository;

    private final SpeakerMapper speakerMapper;

    private SpeakerResponse finishSpeaker(
        Long speakerId,
        SpeakerStatus finalStatus) {

    SpeakerQueue speaker = speakerQueueRepository.findById(speakerId)
            .orElseThrow(() ->
                    new RuntimeException("Speaker not found."));

    if (speaker.getStatus() != SpeakerStatus.ACTIVE) {
        throw new IllegalStateException(
                "Only the active speaker can be updated.");
    }

    speaker.setStatus(finalStatus);
    speaker.setRemainingTimeSeconds(0);
    speaker.setEndedAt(LocalDateTime.now());

    speakerQueueRepository.save(speaker);

    List<SpeakerQueue> waitingSpeakers =
            speakerQueueRepository
                    .findBySessionIdAndStatusOrderByQueuePosition(
                            speaker.getSession().getId(),
                            SpeakerStatus.WAITING);

    if (!waitingSpeakers.isEmpty()) {

        SpeakerQueue nextSpeaker = waitingSpeakers.get(0);

        nextSpeaker.setStatus(SpeakerStatus.ACTIVE);
        nextSpeaker.setStartedAt(LocalDateTime.now());

        speakerQueueRepository.save(nextSpeaker);
    }

    return speakerMapper.toSpeakerResponse(speaker);
}
    public SpeakerQueueServiceImpl(
            SpeakerQueueRepository speakerQueueRepository,
            DebateSessionRepository sessionRepository,
            UserRepository userRepository,
            SpeakerMapper speakerMapper) {

        this.speakerQueueRepository = speakerQueueRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.speakerMapper = speakerMapper;


        
    }

@Override
public SpeakerResponse addSpeaker(AddSpeakerRequest request) {

    // Verify session exists
    DebateSession session = sessionRepository
            .findById(request.getSessionId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Debate session not found."));

    // Session must be ACTIVE
    if (session.getStatus() != SessionStatus.ACTIVE) {
        throw new IllegalStateException(
                "Speakers can only be added to an active debate session.");
    }

    // Verify delegate exists
    User delegate = userRepository
            .findById(request.getDelegateId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Delegate not found."));

    // Prevent duplicate active/waiting speakers
    List<SpeakerQueue> queue =
            speakerQueueRepository
                    .findBySessionIdOrderByQueuePosition(
                            session.getId());

    boolean alreadyQueued = queue.stream().anyMatch(
            speaker ->
                    speaker.getDelegate().getId().equals(delegate.getId())
                    &&
                    (speaker.getStatus() == SpeakerStatus.WAITING
                     || speaker.getStatus() == SpeakerStatus.ACTIVE));

    if (alreadyQueued) {
        throw new IllegalStateException(
                "Delegate is already in the speaker queue.");
    }

    // Determine next queue position
    int nextPosition =
            (int) speakerQueueRepository
                    .countBySessionId(session.getId()) + 1;

    // Create queue entry
    SpeakerQueue speaker = new SpeakerQueue();

    speaker.setSession(session);

    speaker.setDelegate(delegate);

    speaker.setQueuePosition(nextPosition);

    speaker.setAllottedTimeSeconds(
            request.getAllottedTimeSeconds());

    speaker.setRemainingTimeSeconds(
            request.getAllottedTimeSeconds());

    speaker.setStatus(SpeakerStatus.WAITING);

    speaker.setRequestedAt(LocalDateTime.now());

    SpeakerQueue savedSpeaker =
            speakerQueueRepository.save(speaker);

    return speakerMapper.toSpeakerResponse(savedSpeaker);
}

@Override
public SpeakerResponse completeSpeaker(Long speakerId) {

    return finishSpeaker(
            speakerId,
            SpeakerStatus.COMPLETED);
}
@Override
public SpeakerResponse getCurrentSpeaker(Long sessionId) {

    SpeakerQueue speaker =
            speakerQueueRepository
                    .findBySessionIdAndStatus(
                            sessionId,
                            SpeakerStatus.ACTIVE)
                    .orElse(null);

    if (speaker == null) {
        return null;
    }

    return speakerMapper.toSpeakerResponse(speaker);
}

@Override
public List<SpeakerResponse> getQueue(Long sessionId) {

    return speakerQueueRepository
            .findBySessionIdOrderByQueuePosition(sessionId)
            .stream()
            .map(speakerMapper::toSpeakerResponse)
            .toList();
}

@Override
public SpeakerResponse skipSpeaker(Long speakerId) {

    return finishSpeaker(
            speakerId,
            SpeakerStatus.SKIPPED);
}

@Override
public SpeakerResponse startNextSpeaker(Long sessionId) {

    // Verify session exists
    DebateSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() ->
                    new RuntimeException("Debate session not found."));

    // Session must be active
    if (session.getStatus() != SessionStatus.ACTIVE) {
        throw new IllegalStateException(
                "Debate session is not active.");
    }

    // Ensure no speaker is already active
    if (speakerQueueRepository
            .findBySessionIdAndStatus(sessionId, SpeakerStatus.ACTIVE)
            .isPresent()) {

        throw new IllegalStateException(
                "A speaker is already active.");
    }

    // Find the next waiting speaker
    List<SpeakerQueue> waitingSpeakers =
            speakerQueueRepository
                    .findBySessionIdAndStatusOrderByQueuePosition(
                            sessionId,
                            SpeakerStatus.WAITING);

    if (waitingSpeakers.isEmpty()) {
        throw new RuntimeException(
                "No speakers are waiting.");
    }

    SpeakerQueue nextSpeaker = waitingSpeakers.get(0);

    nextSpeaker.setStatus(SpeakerStatus.ACTIVE);

    LocalDateTime now = LocalDateTime.now();

nextSpeaker.setStartedAt(now);

nextSpeaker.setTimerStartedAt(now);

nextSpeaker.setTimerRunning(true);

    SpeakerQueue savedSpeaker =
            speakerQueueRepository.save(nextSpeaker);

    return speakerMapper.toSpeakerResponse(savedSpeaker);
}

@Override
public SpeakerResponse pauseTimer(Long speakerId) {

    SpeakerQueue speaker = speakerQueueRepository.findById(speakerId)
            .orElseThrow(() ->
                    new RuntimeException("Speaker not found."));

    // Only the active speaker can have a running timer
    if (speaker.getStatus() != SpeakerStatus.ACTIVE) {
        throw new IllegalStateException(
                "Only the active speaker's timer can be paused.");
    }

    if (!speaker.isTimerRunning()) {
        throw new IllegalStateException(
                "Timer is already paused.");
    }

    LocalDateTime now = LocalDateTime.now();

    long elapsedSeconds = java.time.Duration
            .between(speaker.getTimerStartedAt(), now)
            .getSeconds();

    int remaining = speaker.getRemainingTimeSeconds()
            - (int) elapsedSeconds;

    if (remaining < 0) {
        remaining = 0;
    }

    speaker.setRemainingTimeSeconds(remaining);
    speaker.setTimerRunning(false);
    speaker.setTimerStartedAt(null);

    SpeakerQueue savedSpeaker =
            speakerQueueRepository.save(speaker);

    return speakerMapper.toSpeakerResponse(savedSpeaker);
}

@Override
public SpeakerResponse resumeTimer(Long speakerId) {

    SpeakerQueue speaker = speakerQueueRepository.findById(speakerId)
            .orElseThrow(() ->
                    new RuntimeException("Speaker not found."));

    if (speaker.getStatus() != SpeakerStatus.ACTIVE) {
        throw new IllegalStateException(
                "Only the active speaker's timer can be resumed.");
    }

    if (speaker.isTimerRunning()) {
        throw new IllegalStateException(
                "Timer is already running.");
    }

    if (speaker.getRemainingTimeSeconds() <= 0) {
        throw new IllegalStateException(
                "Speaker has no remaining time.");
    }

    speaker.setTimerRunning(true);
    speaker.setTimerStartedAt(LocalDateTime.now());

    SpeakerQueue savedSpeaker = speakerQueueRepository.save(speaker);

    return speakerMapper.toSpeakerResponse(savedSpeaker);
}

@Override
public SpeakerResponse extendTime(Long speakerId, Integer seconds) {

    SpeakerQueue speaker = speakerQueueRepository.findById(speakerId)
            .orElseThrow(() ->
                    new RuntimeException("Speaker not found."));

    if (speaker.getStatus() != SpeakerStatus.ACTIVE) {
        throw new IllegalStateException(
                "Only the active speaker's time can be extended.");
    }

    if (seconds == null || seconds <= 0) {
        throw new IllegalArgumentException(
                "Extension time must be greater than zero.");
    }

    speaker.setRemainingTimeSeconds(
            speaker.getRemainingTimeSeconds() + seconds);

    SpeakerQueue savedSpeaker =
            speakerQueueRepository.save(speaker);

    return speakerMapper.toSpeakerResponse(savedSpeaker);
}

@Override
public SpeakerResponse getTimer(Long speakerId) {

    SpeakerQueue speaker = speakerQueueRepository.findById(speakerId)
            .orElseThrow(() ->
                    new RuntimeException("Speaker not found."));

    SpeakerResponse response =
            speakerMapper.toSpeakerResponse(speaker);

    if (speaker.isTimerRunning()
            && speaker.getTimerStartedAt() != null) {

        long elapsedSeconds = Duration
                .between(
                        speaker.getTimerStartedAt(),
                        LocalDateTime.now())
                .getSeconds();

        int remaining =
                speaker.getRemainingTimeSeconds()
                        - (int) elapsedSeconds;

        if (remaining < 0) {
            remaining = 0;
        }

        response.setRemainingTimeSeconds(remaining);
    }

    return response;
}
}