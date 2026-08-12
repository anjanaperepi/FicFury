package com.ficfury.debate.controller;

import com.ficfury.debate.dto.request.CreateMotionRequest;
import com.ficfury.debate.dto.response.MotionResponse;
import com.ficfury.debate.service.MotionService;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/debate/motions")
public class MotionController {

    private final MotionService motionService;

    public MotionController(MotionService motionService) {
        this.motionService = motionService;
    }

    

@PostMapping
public ResponseEntity<MotionResponse> raiseMotion(
        @RequestBody CreateMotionRequest request) {

    System.out.println("MotionController reached!");

    return ResponseEntity.ok(
            motionService.raiseMotion(request));
}

@PostMapping("/{motionId}/approve")
public ResponseEntity<MotionResponse> approveMotion(
        @PathVariable Long motionId,
        @RequestParam Long chairId) {

    return ResponseEntity.ok(
            motionService.approveMotion(motionId, chairId)
    );
}
@PostMapping("/{motionId}/dismiss")
public ResponseEntity<MotionResponse> dismissMotion(
        @PathVariable Long motionId,
        @RequestParam Long chairId) {

    return ResponseEntity.ok(
            motionService.dismissMotion(motionId, chairId)
    );
}
@PostMapping("/{motionId}/execute")
public ResponseEntity<MotionResponse> executeMotion(
        @PathVariable Long motionId) {

    return ResponseEntity.ok(
            motionService.executeMotion(motionId)
    );
}
@GetMapping("/{motionId}")
public ResponseEntity<MotionResponse> getMotion(
        @PathVariable Long motionId) {

    return ResponseEntity.ok(
            motionService.getMotion(motionId)
    );
}
@GetMapping("/session/{sessionId}/pending")
public ResponseEntity<List<MotionResponse>> getPendingMotions(
        @PathVariable Long sessionId) {

    return ResponseEntity.ok(
            motionService.getPendingMotions(sessionId)
    );
}

@GetMapping("/session/{sessionId}")
public ResponseEntity<List<MotionResponse>> getSessionMotions(
        @PathVariable Long sessionId) {

    return ResponseEntity.ok(
            motionService.getSessionMotions(sessionId)
    );
}
}
