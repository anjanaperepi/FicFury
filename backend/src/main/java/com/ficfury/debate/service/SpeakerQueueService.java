package com.ficfury.debate.service;

import java.util.List;

import com.ficfury.debate.dto.request.AddSpeakerRequest;
import com.ficfury.debate.dto.response.SpeakerResponse;

public interface SpeakerQueueService {

    SpeakerResponse addSpeaker(
            AddSpeakerRequest request);

    SpeakerResponse startNextSpeaker(
            Long sessionId);

    SpeakerResponse completeSpeaker(
            Long speakerId);

    SpeakerResponse skipSpeaker(
            Long speakerId);

    List<SpeakerResponse> getQueue(
            Long sessionId);

    SpeakerResponse getCurrentSpeaker(
            Long sessionId);

    SpeakerResponse pauseTimer(Long speakerId);

SpeakerResponse resumeTimer(Long speakerId);

SpeakerResponse extendTime(Long speakerId, Integer seconds);

SpeakerResponse getTimer(Long speakerId);
}