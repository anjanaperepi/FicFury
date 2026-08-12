package com.ficfury.debate.mapper;

import org.springframework.stereotype.Component;

import com.ficfury.debate.dto.response.SpeakerResponse;
import com.ficfury.debate.entity.SpeakerQueue;

@Component
public class SpeakerMapper {

    public SpeakerResponse toSpeakerResponse(SpeakerQueue speaker) {

        SpeakerResponse response = new SpeakerResponse();

        response.setId(speaker.getId());

        response.setSessionId(
                speaker.getSession().getId());

        response.setDelegateId(
                speaker.getDelegate().getId());

        response.setDelegateName(
                speaker.getDelegate().getFullName());

        response.setQueuePosition(
                speaker.getQueuePosition());

        response.setAllottedTimeSeconds(
                speaker.getAllottedTimeSeconds());

        response.setRemainingTimeSeconds(
                speaker.getRemainingTimeSeconds());

        response.setStatus(
                speaker.getStatus());

        response.setRequestedAt(
                speaker.getRequestedAt());

        response.setStartedAt(
                speaker.getStartedAt());

        response.setEndedAt(
                speaker.getEndedAt());

        response.setTimerRunning(
        speaker.isTimerRunning());

        return response;
    }
}
