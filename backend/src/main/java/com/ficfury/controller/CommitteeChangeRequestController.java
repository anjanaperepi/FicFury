package com.ficfury.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.CommitteeChangeRequestDTO;
import com.ficfury.model.CommitteeChangeRequest;
import com.ficfury.service.CommitteeChangeRequestService;

@RestController
@RequestMapping("/api/committee-change-requests")
public class CommitteeChangeRequestController {


    private final CommitteeChangeRequestService requestService;


    public CommitteeChangeRequestController(
            CommitteeChangeRequestService requestService
    ) {

        this.requestService =
                requestService;

    }


    // =====================================================
    // CHAIR — CREATE REQUEST
    // =====================================================

    @PostMapping
    @PreAuthorize("hasRole('CHAIR')")
    public ResponseEntity<CommitteeChangeRequest>
    createRequest(
            @RequestBody CommitteeChangeRequestDTO dto
    ) {

        return ResponseEntity.ok(
                requestService.createRequest(dto)
        );

    }


    // =====================================================
    // CHAIR — MY REQUESTS
    // =====================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('CHAIR')")
    public ResponseEntity<List<CommitteeChangeRequest>>
    getMyRequests() {

        return ResponseEntity.ok(
                requestService.getMyRequests()
        );

    }


    // =====================================================
    // ADMIN — PENDING REQUESTS
    // =====================================================

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CommitteeChangeRequest>>
    getPendingRequests() {

        return ResponseEntity.ok(
                requestService.getPendingRequests()
        );

    }


    // =====================================================
    // ADMIN — APPROVE
    // =====================================================

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommitteeChangeRequest>
    approveRequest(
            @PathVariable Long id,
            @RequestParam(
                    required = false
            ) String comment
    ) {

        return ResponseEntity.ok(
                requestService.approveRequest(
                        id,
                        comment
                )
        );

    }


    // =====================================================
    // ADMIN — REJECT
    // =====================================================

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommitteeChangeRequest>
    rejectRequest(
            @PathVariable Long id,
            @RequestParam(
                    required = false
            ) String comment
    ) {

        return ResponseEntity.ok(
                requestService.rejectRequest(
                        id,
                        comment
                )
        );

    }

}