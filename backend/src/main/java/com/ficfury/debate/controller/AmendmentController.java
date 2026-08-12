package com.ficfury.debate.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ficfury.debate.dto.request.CreateAmendmentRequest;
import com.ficfury.debate.dto.response.AmendmentResponse;
import com.ficfury.debate.service.AmendmentService;

@RestController
@RequestMapping("/api/debate/amendments")
public class AmendmentController {

    private final AmendmentService amendmentService;

    public AmendmentController(
            AmendmentService amendmentService) {

        this.amendmentService = amendmentService;
    }

    @PostMapping
    public ResponseEntity<AmendmentResponse> create(
            @RequestBody CreateAmendmentRequest request) {

        return ResponseEntity.ok(
                amendmentService.createAmendment(request));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<AmendmentResponse> approve(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                amendmentService.approveAmendment(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<AmendmentResponse> reject(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                amendmentService.rejectAmendment(id));
    }

    @GetMapping("/resolution/{resolutionId}")
    public ResponseEntity<List<AmendmentResponse>> getByResolution(
            @PathVariable Long resolutionId) {

        return ResponseEntity.ok(
                amendmentService.getResolutionAmendments(resolutionId));
    }

    @GetMapping("/resolution/{resolutionId}/pending")
    public ResponseEntity<List<AmendmentResponse>> getPending(
            @PathVariable Long resolutionId) {

        return ResponseEntity.ok(
                amendmentService.getPendingAmendments(resolutionId));
    }
}