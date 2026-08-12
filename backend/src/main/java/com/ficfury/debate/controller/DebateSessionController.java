package com.ficfury.debate.controller;

import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.SessionStatus;
import com.ficfury.debate.service.DebateSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ficfury.debate.dto.request.ActiveSessionResponse;
import com.ficfury.debate.dto.request.CreateDebateSessionRequest;
import com.ficfury.debate.dto.response.DebateSessionResponse;

import java.util.List;

@RestController
@RequestMapping("/api/debate/sessions")
@CrossOrigin(origins = "*")
public class DebateSessionController {

    private final DebateSessionService debateSessionService;

    public DebateSessionController(DebateSessionService debateSessionService) {
        this.debateSessionService = debateSessionService;
    }

@PostMapping
public ResponseEntity<DebateSessionResponse> createSession(
        @RequestBody CreateDebateSessionRequest request) {
System.out.println("DebateSessionController reached!");
    return ResponseEntity.ok(
            debateSessionService.createSession(request)
    );
}

    @GetMapping
    public ResponseEntity<List<DebateSessionResponse>> getAllSessions() {

        return ResponseEntity.ok(
                debateSessionService.getAllSessions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DebateSessionResponse> getSession(
            @PathVariable Long id) {

        return debateSessionService.getSession(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DebateSessionResponse>> getByStatus(
            @PathVariable SessionStatus status) {

        return ResponseEntity.ok(
                debateSessionService.getSessionsByStatus(status)
        );
    }

    @PostMapping("/{id}/initiate")
    public ResponseEntity<DebateSessionResponse> initiateSession(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                debateSessionService.initiateSession(id)
        );
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<DebateSessionResponse> activateSession(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                debateSessionService.activateSession(id)
        );
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<DebateSessionResponse> stopSession(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                debateSessionService.stopSession(id)
        );
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<DebateSessionResponse> archiveSession(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                debateSessionService.archiveSession(id)
        );
    }

    @GetMapping("/active/{committeeId}")
public ResponseEntity<ActiveSessionResponse>
getActiveSession(
        @PathVariable Long committeeId) {

    return ResponseEntity.ok(
            debateSessionService
                    .getActiveSession(committeeId)
    );

}

@GetMapping("/chair/{chairId}")
public ResponseEntity<DebateSessionResponse> getChairSession(
        @PathVariable Long chairId) {

                System.out.println(">>> INSIDE CHAIR ENDPOINT <<<");

    return ResponseEntity.ok(
            debateSessionService.getChairSession(chairId)
    );

}
}
