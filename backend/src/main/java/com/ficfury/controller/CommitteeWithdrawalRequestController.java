package com.ficfury.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.CommitteeWithdrawalRequestDTO;
import com.ficfury.model.CommitteeWithdrawalRequest;
import com.ficfury.service.CommitteeWithdrawalRequestService;

@RestController
@RequestMapping("/api/committee-withdrawal-requests")
@CrossOrigin("*")
public class CommitteeWithdrawalRequestController {


    private final CommitteeWithdrawalRequestService requestService;


    public CommitteeWithdrawalRequestController(
            CommitteeWithdrawalRequestService requestService
    ) {

        this.requestService =
                requestService;

    }


    // =====================================================
    // DELEGATE — CREATE REQUEST
    // =====================================================

    @PreAuthorize("hasRole('DELEGATE')")
    @PostMapping
    public CommitteeWithdrawalRequest createRequest(
            @RequestBody CommitteeWithdrawalRequestDTO request
    ) {

        return requestService.createRequest(
                request
        );

    }


    // =====================================================
    // DELEGATE — MY REQUESTS
    // =====================================================

    @PreAuthorize("hasRole('DELEGATE')")
    @GetMapping("/my")
    public List<CommitteeWithdrawalRequest>
    getMyRequests() {

        return requestService.getMyRequests();

    }


    // =====================================================
    // ADMIN / CHAIR — PENDING REQUESTS
    // =====================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @GetMapping("/pending")
    public List<CommitteeWithdrawalRequest>
    getPendingRequests() {

        return requestService.getPendingRequests();

    }


    // =====================================================
    // ADMIN / CHAIR — APPROVE
    // =====================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @PutMapping("/{id}/approve")
    public CommitteeWithdrawalRequest approveRequest(
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
    // ADMIN / CHAIR — REJECT
    // =====================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @PutMapping("/{id}/reject")
    public CommitteeWithdrawalRequest rejectRequest(
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