package com.ficfury.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.CharacterChangeRequestDTO;
import com.ficfury.model.CharacterChangeRequest;
import com.ficfury.service.CharacterChangeRequestService;

@RestController
@RequestMapping("/api/character-change-requests")
@CrossOrigin("*")
public class CharacterChangeRequestController {


    private final CharacterChangeRequestService requestService;


    public CharacterChangeRequestController(
            CharacterChangeRequestService requestService
    ) {

        this.requestService =
                requestService;

    }


    // =====================================================
    // DELEGATE — CREATE REQUEST
    // =====================================================

    @PreAuthorize("hasRole('DELEGATE')")
    @PostMapping
    public CharacterChangeRequest createRequest(
            @RequestBody CharacterChangeRequestDTO request
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
    public List<CharacterChangeRequest>
    getMyRequests() {

        return requestService.getMyRequests();

    }


    // =====================================================
    // ADMIN / CHAIR — PENDING REQUESTS
    // =====================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @GetMapping("/pending")
    public List<CharacterChangeRequest>
    getPendingRequests() {

        return requestService.getPendingRequests();

    }


    // =====================================================
    // ADMIN / CHAIR — APPROVE
    // =====================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @PutMapping("/{id}/approve")
    public CharacterChangeRequest approveRequest(
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
    public CharacterChangeRequest rejectRequest(
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