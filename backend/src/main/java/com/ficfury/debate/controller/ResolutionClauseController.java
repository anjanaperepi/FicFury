package com.ficfury.debate.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ficfury.debate.dto.response.ResolutionClauseResponse;
import com.ficfury.debate.service.ResolutionClauseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/debate/clauses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResolutionClauseController {

    private final ResolutionClauseService resolutionClauseService;

    @GetMapping("/resolution/{resolutionId}")
    public ResponseEntity<List<ResolutionClauseResponse>> getResolutionClauses(
            @PathVariable Long resolutionId) {

        return ResponseEntity.ok(
                resolutionClauseService.getClauses(resolutionId)
        );

    }

}