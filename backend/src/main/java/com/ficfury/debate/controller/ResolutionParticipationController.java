package com.ficfury.debate.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ficfury.debate.dto.request.AddSignatoryRequest;
import com.ficfury.debate.dto.request.AddSponsorRequest;
import com.ficfury.debate.dto.response.SignatoryResponse;
import com.ficfury.debate.dto.response.SponsorResponse;
import com.ficfury.debate.service.ResolutionParticipationService;

@RestController
@RequestMapping("/api/debate/resolutions")
public class ResolutionParticipationController {

    private final ResolutionParticipationService participationService;

    public ResolutionParticipationController(
            ResolutionParticipationService participationService) {

        this.participationService = participationService;
    }

    @PostMapping("/sponsors")
    public ResponseEntity<SponsorResponse> addSponsor(
            @RequestBody AddSponsorRequest request) {
                System.out.println("=== ADD SPONSOR ENDPOINT HIT ===");
        return ResponseEntity.ok(
                participationService.addSponsor(request));
    }

    @PostMapping("/signatories")
    public ResponseEntity<SignatoryResponse> addSignatory(
            @RequestBody AddSignatoryRequest request) {

        return ResponseEntity.ok(
                participationService.addSignatory(request));
    }

    @GetMapping("/{resolutionId}/sponsors")
    public ResponseEntity<List<SponsorResponse>> getSponsors(
            @PathVariable Long resolutionId) {

        return ResponseEntity.ok(
                participationService.getSponsors(resolutionId));
    }

    @GetMapping("/{resolutionId}/signatories")
    public ResponseEntity<List<SignatoryResponse>> getSignatories(
            @PathVariable Long resolutionId) {

        return ResponseEntity.ok(
                participationService.getSignatories(resolutionId));
    }

    @DeleteMapping("/sponsors/{sponsorId}")
    public ResponseEntity<Void> removeSponsor(
            @PathVariable Long sponsorId) {

        participationService.removeSponsor(sponsorId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/signatories/{signatoryId}")
    public ResponseEntity<Void> removeSignatory(
            @PathVariable Long signatoryId) {

        participationService.removeSignatory(signatoryId);

        return ResponseEntity.noContent().build();
    }
}