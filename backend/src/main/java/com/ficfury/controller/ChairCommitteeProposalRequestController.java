package com.ficfury.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.ChairCommitteeProposalRequestDTO;
import com.ficfury.model.ChairCommitteeProposalRequest;
import com.ficfury.service.ChairCommitteeProposalRequestService;

@RestController
@RequestMapping("/api/chair-committee-proposals")
@CrossOrigin("*")
public class ChairCommitteeProposalRequestController {


    private final ChairCommitteeProposalRequestService requestService;


    public ChairCommitteeProposalRequestController(
            ChairCommitteeProposalRequestService requestService
    ) {

        this.requestService =
                requestService;
    }


    // =====================================================
    // CHAIR — SUBMIT PROPOSAL
    // =====================================================

    @PreAuthorize("hasRole('CHAIR')")
    @PostMapping
    public ChairCommitteeProposalRequest createRequest(
            @RequestBody ChairCommitteeProposalRequestDTO request
    ) {
    System.out.println(
        "Chair proposal endpoint reached"
    );

        return requestService.createRequest(
                request
        );
    }


    // =====================================================
    // CHAIR — MY PROPOSALS
    // =====================================================

    @PreAuthorize("hasRole('CHAIR')")
    @GetMapping("/my")
    public List<ChairCommitteeProposalRequest>
    getMyRequests() {

        return requestService.getMyRequests();
    }


    // =====================================================
    // ADMIN — PENDING PROPOSALS
    // =====================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public List<ChairCommitteeProposalRequest>
    getPendingRequests() {

        return requestService.getPendingRequests();
    }


    // =====================================================
    // ADMIN — APPROVE
    // =====================================================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public ChairCommitteeProposalRequest approveRequest(
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
    public ChairCommitteeProposalRequest rejectRequest(
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