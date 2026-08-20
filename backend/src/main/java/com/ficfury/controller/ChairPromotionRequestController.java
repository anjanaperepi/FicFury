package com.ficfury.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.ChairPromotionRequestDTO;
import com.ficfury.model.ChairPromotionRequest;
import com.ficfury.service.ChairPromotionRequestService;

@RestController
@RequestMapping("/api/chair-promotion-requests")
@CrossOrigin("*")
public class ChairPromotionRequestController {


    private final ChairPromotionRequestService requestService;


    public ChairPromotionRequestController(
            ChairPromotionRequestService requestService
    ) {

        this.requestService =
                requestService;

    }


    // =====================================================
    // DELEGATE — SUBMIT PROPOSAL
    // =====================================================

    @PreAuthorize("hasRole('DELEGATE')")
    @PostMapping
    public ChairPromotionRequest createRequest(
            @RequestBody ChairPromotionRequestDTO request
    ) {

        return requestService.createRequest(
                request
        );

    }


    // =====================================================
    // DELEGATE — MY PROPOSALS
    // =====================================================

    @PreAuthorize("hasRole('DELEGATE')")
    @GetMapping("/my")
    public List<ChairPromotionRequest>
    getMyRequests() {

        return requestService.getMyRequests();

    }


    // =====================================================
    // ADMIN — PENDING PROPOSALS
    // =====================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public List<ChairPromotionRequest>
    getPendingRequests() {

        return requestService.getPendingRequests();

    }


    // =====================================================
    // ADMIN — APPROVE
    // =====================================================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public ChairPromotionRequest approveRequest(
            @PathVariable Long id,
            @RequestParam(
                    required = false
            ) String comment
    ) {

        return requestService.approveRequest(
                id,
                comment
        );

    }


    // =====================================================
    // ADMIN — REJECT
    // =====================================================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/reject")
    public ChairPromotionRequest rejectRequest(
            @PathVariable Long id,
            @RequestParam(
                    required = false
            ) String comment
    ) {

        return requestService.rejectRequest(
                id,
                comment
        );

    }

}