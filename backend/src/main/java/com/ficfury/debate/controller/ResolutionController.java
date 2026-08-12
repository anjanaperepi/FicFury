package com.ficfury.debate.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ficfury.debate.dto.request.CreateResolutionRequest;
import com.ficfury.debate.dto.request.UpdateResolutionRequest;
import com.ficfury.debate.dto.response.ResolutionResponse;
import com.ficfury.debate.dto.response.ResolutionResultResponse;
import com.ficfury.debate.service.ResolutionService;

@RestController
@RequestMapping("/api/debate/resolutions")
public class ResolutionController {

    private final ResolutionService resolutionService;

    public ResolutionController(ResolutionService resolutionService) {
        this.resolutionService = resolutionService;
    }

    @PostMapping
    public ResponseEntity<ResolutionResponse> createResolution(
            @RequestBody CreateResolutionRequest request) {

        return ResponseEntity.ok(
                resolutionService.createResolution(request));
    }

    @PutMapping("/{resolutionId}")
    public ResponseEntity<ResolutionResponse> updateResolution(
            @PathVariable Long resolutionId,
            @RequestBody UpdateResolutionRequest request) {

        return ResponseEntity.ok(
                resolutionService.updateResolution(
                        resolutionId,
                        request));
    }




    @DeleteMapping("/{resolutionId}")
    public ResponseEntity<Void> deleteResolution(
            @PathVariable Long resolutionId) {

        resolutionService.deleteResolution(resolutionId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{resolutionId}")
    public ResponseEntity<ResolutionResponse> getResolution(
            @PathVariable Long resolutionId) {

        return ResponseEntity.ok(
                resolutionService.getResolution(resolutionId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ResolutionResponse>> getSessionResolutions(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                resolutionService.getSessionResolutions(sessionId));
    }

    @GetMapping("/session/{sessionId}/approved")
    public ResponseEntity<List<ResolutionResponse>> getApprovedResolutions(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                resolutionService.getApprovedResolutions(sessionId));
    }

    @PostMapping("/{id}/submit")
public ResponseEntity<ResolutionResponse> submit(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.submitResolution(id));
}
@PostMapping("/{id}/approve")
public ResponseEntity<ResolutionResponse> approve(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.approveResolution(id));
}
@PostMapping("/{id}/reject")
public ResponseEntity<ResolutionResponse> reject(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.rejectResolution(id));
}
@PostMapping("/{id}/passed")
public ResponseEntity<ResolutionResponse> passed(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.markPassed(id));
}
@PostMapping("/{id}/failed")
public ResponseEntity<ResolutionResponse> failed(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.markFailed(id));
}

@PostMapping("/{id}/open-voting")
public ResponseEntity<ResolutionResponse> openVoting(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.openVoting(id));
}
@PostMapping("/{id}/close-voting")
public ResponseEntity<ResolutionResponse> closeVoting(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.closeVoting(id));

}

@PostMapping("/{id}/open-amendments")
public ResponseEntity<ResolutionResponse> openAmendments(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.openAmendments(id));

}

@PostMapping("/{id}/close-amendments")
public ResponseEntity<ResolutionResponse> closeAmendments(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.closeAmendments(id));

}

@GetMapping("/{id}/results")
public ResponseEntity<ResolutionResultResponse> getResults(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            resolutionService.getResults(id));

}

}
