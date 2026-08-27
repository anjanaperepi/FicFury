package com.ficfury.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.ResourceResponse;
import com.ficfury.service.ResourceService;

@RestController
@RequestMapping("/api/delegate/resources")
public class DelegateResourceController {

    private final ResourceService resourceService;

    public DelegateResourceController(
            ResourceService resourceService) {

        this.resourceService = resourceService;
    }


    @GetMapping
    public List<ResourceResponse> getResources(
            @RequestParam Long committeeId,
            Authentication authentication) {

        return resourceService.getApprovedResources(
                committeeId,
                authentication.getName()
        );
    }


    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            Authentication authentication)
            throws IOException {

        return resourceService.downloadResource(
                id,
                authentication.getName()
        );
    }

}