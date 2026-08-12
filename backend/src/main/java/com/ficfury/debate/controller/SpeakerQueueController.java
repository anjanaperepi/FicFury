package com.ficfury.debate.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ficfury.debate.dto.request.AddSpeakerRequest;
import com.ficfury.debate.dto.response.SpeakerResponse;
import com.ficfury.debate.service.SpeakerQueueService;

@RestController
@RequestMapping("/api/debate/speakers")
public class SpeakerQueueController {

    private final SpeakerQueueService speakerQueueService;

    public SpeakerQueueController(
            SpeakerQueueService speakerQueueService) {

        this.speakerQueueService = speakerQueueService;
    }

    @PostMapping
    public ResponseEntity<SpeakerResponse> addSpeaker(
            @RequestBody AddSpeakerRequest request) {

        System.out.println("SpeakerQueueController reached!");

        return ResponseEntity.ok(
                speakerQueueService.addSpeaker(request));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SpeakerResponse>> getQueue(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                speakerQueueService.getQueue(sessionId));
    }

    @GetMapping("/session/{sessionId}/current")
    public ResponseEntity<SpeakerResponse> getCurrentSpeaker(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                speakerQueueService.getCurrentSpeaker(sessionId));
    }

    @PostMapping("/session/{sessionId}/start")
    public ResponseEntity<SpeakerResponse> startNextSpeaker(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                speakerQueueService.startNextSpeaker(sessionId));
    }

    @PostMapping("/{speakerId}/complete")
    public ResponseEntity<SpeakerResponse> completeSpeaker(
            @PathVariable Long speakerId) {

        return ResponseEntity.ok(
                speakerQueueService.completeSpeaker(speakerId));
    }

    @PostMapping("/{speakerId}/skip")
    public ResponseEntity<SpeakerResponse> skipSpeaker(
            @PathVariable Long speakerId) {

        return ResponseEntity.ok(
                speakerQueueService.skipSpeaker(speakerId));
    }

    @PostMapping("/{speakerId}/pause")
public ResponseEntity<SpeakerResponse> pauseTimer(
        @PathVariable Long speakerId) {

    return ResponseEntity.ok(
            speakerQueueService.pauseTimer(speakerId));
}

@PostMapping("/{speakerId}/resume")
public ResponseEntity<SpeakerResponse> resumeTimer(
        @PathVariable Long speakerId) {

    return ResponseEntity.ok(
            speakerQueueService.resumeTimer(speakerId));
}

@PostMapping("/{speakerId}/extend")
public ResponseEntity<SpeakerResponse> extendTime(
        @PathVariable Long speakerId,
        @RequestParam Integer seconds) {

    return ResponseEntity.ok(
            speakerQueueService.extendTime(
                    speakerId,
                    seconds));
}
@GetMapping("/{speakerId}/timer")
public ResponseEntity<SpeakerResponse> getTimer(
        @PathVariable Long speakerId) {

    return ResponseEntity.ok(
            speakerQueueService.getTimer(speakerId));
}


}
