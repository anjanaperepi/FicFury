package com.ficfury.debate.service.impl;

import java.time.Duration;
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
import com.ficfury.websocket.CommitteeEventPublisher;

import org.springframework.transaction.annotation.Transactional;


@Service
public class SpeakerQueueServiceImpl
        implements SpeakerQueueService {


    private final SpeakerQueueRepository speakerQueueRepository;

    private final DebateSessionRepository sessionRepository;

    private final UserRepository userRepository;

    private final SpeakerMapper speakerMapper;

    private final CommitteeEventPublisher committeeEventPublisher;


    public SpeakerQueueServiceImpl(
            SpeakerQueueRepository speakerQueueRepository,
            DebateSessionRepository sessionRepository,
            UserRepository userRepository,
            SpeakerMapper speakerMapper,
            CommitteeEventPublisher committeeEventPublisher) {

        this.speakerQueueRepository =
                speakerQueueRepository;

        this.sessionRepository =
                sessionRepository;

        this.userRepository =
                userRepository;

        this.speakerMapper =
                speakerMapper;

        this.committeeEventPublisher =
                committeeEventPublisher;
    }


    /* =========================================================
       FINISH ACTIVE SPEAKER
       ========================================================= */

    private SpeakerResponse finishSpeaker(
            Long speakerId,
            SpeakerStatus finalStatus) {


        SpeakerQueue speaker =
                speakerQueueRepository
                        .findById(speakerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Speaker not found."));


        if (speaker.getStatus()
                != SpeakerStatus.ACTIVE) {

            throw new IllegalStateException(
                    "Only the active speaker can be updated.");
        }


        speaker.setStatus(finalStatus);

        speaker.setRemainingTimeSeconds(0);

        speaker.setEndedAt(
                LocalDateTime.now());


        SpeakerQueue savedSpeaker =
                speakerQueueRepository.save(
                        speaker);


        /*
         * Notify everyone that the current speaker
         * has finished or been skipped.
         */

        SpeakerResponse finishedResponse =
                speakerMapper.toSpeakerResponse(
                        savedSpeaker);


        String finishEvent =
                finalStatus == SpeakerStatus.COMPLETED
                        ? "SPEAKER_COMPLETED"
                        : "SPEAKER_SKIPPED";


        committeeEventPublisher.publish(
                speaker.getSession().getId(),
                finishEvent,
                null,
                finishedResponse
        );


        /*
         * Automatically activate the next waiting
         * speaker, preserving the existing behavior.
         */

        List<SpeakerQueue> waitingSpeakers =
                speakerQueueRepository
                        .findBySessionIdAndStatusOrderByQueuePosition(
                                speaker.getSession().getId(),
                                SpeakerStatus.WAITING);


        if (!waitingSpeakers.isEmpty()) {

            SpeakerQueue nextSpeaker =
                    waitingSpeakers.get(0);


            LocalDateTime now =
                    LocalDateTime.now();


            nextSpeaker.setStatus(
                    SpeakerStatus.ACTIVE);

            nextSpeaker.setStartedAt(now);

            nextSpeaker.setTimerStartedAt(now);

            nextSpeaker.setTimerRunning(true);


            SpeakerQueue savedNextSpeaker =
                    speakerQueueRepository.save(
                            nextSpeaker);


            SpeakerResponse nextResponse =
                    speakerMapper.toSpeakerResponse(
                            savedNextSpeaker);


            /*
             * Important:
             *
             * The next speaker is activated automatically,
             * so clients need a separate event telling them
             * who is now speaking.
             */

            committeeEventPublisher.publish(
                    speaker.getSession().getId(),
                    "SPEAKER_STARTED",
                    null,
                    nextResponse
            );
        }


        return finishedResponse;
    }


    /* =========================================================
       ADD SPEAKER
       ========================================================= */

    @Override
    public SpeakerResponse addSpeaker(
            AddSpeakerRequest request) {


        DebateSession session =
                sessionRepository
                        .findById(request.getSessionId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Debate session not found."));


        /*
         * Session must be ACTIVE.
         */

        if (session.getStatus()
                != SessionStatus.ACTIVE) {

            throw new IllegalStateException(
                    "Speakers can only be added to an active debate session.");
        }


        /*
         * Verify delegate exists.
         */

        User delegate =
                userRepository
                        .findById(request.getDelegateId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Delegate not found."));


        /*
         * Prevent duplicate active/waiting speakers.
         */

        List<SpeakerQueue> queue =
                speakerQueueRepository
                        .findBySessionIdOrderByQueuePosition(
                                session.getId());


        boolean alreadyQueued =
                queue.stream()
                        .anyMatch(speaker ->
                                speaker.getDelegate()
                                        .getId()
                                        .equals(delegate.getId())
                                        &&
                                (
                                    speaker.getStatus()
                                            == SpeakerStatus.WAITING
                                    ||
                                    speaker.getStatus()
                                            == SpeakerStatus.ACTIVE
                                ));


        if (alreadyQueued) {

            throw new IllegalStateException(
                    "Delegate is already in the speaker queue.");
        }


        /*
         * Determine next queue position.
         */

        int nextPosition =
                (int) speakerQueueRepository
                        .countBySessionId(
                                session.getId())
                + 1;


        /*
         * Create queue entry.
         */

        SpeakerQueue speaker =
                new SpeakerQueue();


        speaker.setSession(session);

        speaker.setDelegate(delegate);

        speaker.setQueuePosition(
                nextPosition);

        speaker.setAllottedTimeSeconds(
                request.getAllottedTimeSeconds());

        speaker.setRemainingTimeSeconds(
                request.getAllottedTimeSeconds());

        speaker.setStatus(
                SpeakerStatus.WAITING);

        speaker.setRequestedAt(
                LocalDateTime.now());


        SpeakerQueue savedSpeaker =
                speakerQueueRepository.save(
                        speaker);


        SpeakerResponse response =
                speakerMapper.toSpeakerResponse(
                        savedSpeaker);


        /*
         * Notify every connected participant
         * that the speaker queue changed.
         */

        committeeEventPublisher.publish(
                session.getId(),
                "SPEAKER_ADDED",
                null,
                response
        );


        return response;
    }


    /* =========================================================
       COMPLETE SPEAKER
       ========================================================= */

    @Override
    public SpeakerResponse completeSpeaker(
            Long speakerId) {

        return finishSpeaker(
                speakerId,
                SpeakerStatus.COMPLETED);
    }


    /* =========================================================
       CURRENT SPEAKER
       ========================================================= */

    @Override
    public SpeakerResponse getCurrentSpeaker(
            Long sessionId) {


        SpeakerQueue speaker =
                speakerQueueRepository
                        .findBySessionIdAndStatus(
                                sessionId,
                                SpeakerStatus.ACTIVE)
                        .orElse(null);


        if (speaker == null) {
            return null;
        }


        return speakerMapper.toSpeakerResponse(
                speaker);
    }


    /* =========================================================
       GET QUEUE
       ========================================================= */

    @Override
    public List<SpeakerResponse> getQueue(
            Long sessionId) {

        return speakerQueueRepository
                .findBySessionIdOrderByQueuePosition(
                        sessionId)
                .stream()
                .map(speakerMapper::toSpeakerResponse)
                .toList();
    }


    /* =========================================================
       SKIP SPEAKER
       ========================================================= */

    @Override
    public SpeakerResponse skipSpeaker(
            Long speakerId) {

        return finishSpeaker(
                speakerId,
                SpeakerStatus.SKIPPED);
    }


    /* =========================================================
       START NEXT SPEAKER
       ========================================================= */

    @Override
    public SpeakerResponse startNextSpeaker(
            Long sessionId) {


        /*
         * Verify session exists.
         */

        DebateSession session =
                sessionRepository
                        .findById(sessionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Debate session not found."));


        /*
         * Session must be active.
         */

        if (session.getStatus()
                != SessionStatus.ACTIVE) {

            throw new IllegalStateException(
                    "Debate session is not active.");
        }


        /*
         * Ensure no speaker is already active.
         */

        if (speakerQueueRepository
                .findBySessionIdAndStatus(
                        sessionId,
                        SpeakerStatus.ACTIVE)
                .isPresent()) {

            throw new IllegalStateException(
                    "A speaker is already active.");
        }


        /*
         * Find next waiting speaker.
         */

        List<SpeakerQueue> waitingSpeakers =
                speakerQueueRepository
                        .findBySessionIdAndStatusOrderByQueuePosition(
                                sessionId,
                                SpeakerStatus.WAITING);


        if (waitingSpeakers.isEmpty()) {

            throw new RuntimeException(
                    "No speakers are waiting.");
        }


        SpeakerQueue nextSpeaker =
                waitingSpeakers.get(0);


        LocalDateTime now =
                LocalDateTime.now();


        nextSpeaker.setStatus(
                SpeakerStatus.ACTIVE);

        nextSpeaker.setStartedAt(now);

        nextSpeaker.setTimerStartedAt(now);

        nextSpeaker.setTimerRunning(true);


        SpeakerQueue savedSpeaker =
                speakerQueueRepository.save(
                        nextSpeaker);


        SpeakerResponse response =
                speakerMapper.toSpeakerResponse(
                        savedSpeaker);


        /*
         * Notify all participants.
         */

        committeeEventPublisher.publish(
                sessionId,
                "SPEAKER_STARTED",
                null,
                response
        );


        return response;
    }


    /* =========================================================
       PAUSE TIMER
       ========================================================= */

    @Override
    public SpeakerResponse pauseTimer(
            Long speakerId) {


        SpeakerQueue speaker =
                speakerQueueRepository
                        .findById(speakerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Speaker not found."));


        /*
         * Only active speaker can have
         * a running timer.
         */

        if (speaker.getStatus()
                != SpeakerStatus.ACTIVE) {

            throw new IllegalStateException(
                    "Only the active speaker's timer can be paused.");
        }


        if (!speaker.isTimerRunning()) {

            throw new IllegalStateException(
                    "Timer is already paused.");
        }


        LocalDateTime now =
                LocalDateTime.now();


        long elapsedSeconds =
                Duration
                        .between(
                                speaker.getTimerStartedAt(),
                                now)
                        .getSeconds();


        int remaining =
                speaker.getRemainingTimeSeconds()
                        - (int) elapsedSeconds;


        if (remaining < 0) {
            remaining = 0;
        }


        speaker.setRemainingTimeSeconds(
                remaining);

        speaker.setTimerRunning(false);

        speaker.setTimerStartedAt(null);


        SpeakerQueue savedSpeaker =
                speakerQueueRepository.save(
                        speaker);


        SpeakerResponse response =
                speakerMapper.toSpeakerResponse(
                        savedSpeaker);


        committeeEventPublisher.publish(
                speaker.getSession().getId(),
                "SPEAKER_PAUSED",
                null,
                response
        );


        return response;
    }


    /* =========================================================
       RESUME TIMER
       ========================================================= */

    @Override
    public SpeakerResponse resumeTimer(
            Long speakerId) {


        SpeakerQueue speaker =
                speakerQueueRepository
                        .findById(speakerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Speaker not found."));


        if (speaker.getStatus()
                != SpeakerStatus.ACTIVE) {

            throw new IllegalStateException(
                    "Only the active speaker's timer can be resumed.");
        }


        if (speaker.isTimerRunning()) {

            throw new IllegalStateException(
                    "Timer is already running.");
        }


        if (speaker.getRemainingTimeSeconds()
                <= 0) {

            throw new IllegalStateException(
                    "Speaker has no remaining time.");
        }


        speaker.setTimerRunning(true);

        speaker.setTimerStartedAt(
                LocalDateTime.now());


        SpeakerQueue savedSpeaker =
                speakerQueueRepository.save(
                        speaker);


        SpeakerResponse response =
                speakerMapper.toSpeakerResponse(
                        savedSpeaker);


        committeeEventPublisher.publish(
                speaker.getSession().getId(),
                "SPEAKER_RESUMED",
                null,
                response
        );


        return response;
    }


    /* =========================================================
       EXTEND TIME
       ========================================================= */

    @Override
    public SpeakerResponse extendTime(
            Long speakerId,
            Integer seconds) {


        SpeakerQueue speaker =
                speakerQueueRepository
                        .findById(speakerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Speaker not found."));


        if (speaker.getStatus()
                != SpeakerStatus.ACTIVE) {

            throw new IllegalStateException(
                    "Only the active speaker's time can be extended.");
        }


        if (seconds == null
                || seconds <= 0) {

            throw new IllegalArgumentException(
                    "Extension time must be greater than zero.");
        }


        speaker.setRemainingTimeSeconds(
                speaker.getRemainingTimeSeconds()
                        + seconds);


        SpeakerQueue savedSpeaker =
                speakerQueueRepository.save(
                        speaker);


        SpeakerResponse response =
                speakerMapper.toSpeakerResponse(
                        savedSpeaker);


        committeeEventPublisher.publish(
                speaker.getSession().getId(),
                "SPEAKER_TIME_EXTENDED",
                null,
                response
        );


        return response;
    }


    /* =========================================================
       GET TIMER
       ========================================================= */

    @Override
    public SpeakerResponse getTimer(
            Long speakerId) {


        SpeakerQueue speaker =
                speakerQueueRepository
                        .findById(speakerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Speaker not found."));


        SpeakerResponse response =
                speakerMapper.toSpeakerResponse(
                        speaker);


        if (speaker.isTimerRunning()
                && speaker.getTimerStartedAt() != null) {


            long elapsedSeconds =
                    Duration
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


            response.setRemainingTimeSeconds(
                    remaining);
        }


        return response;
    }
}