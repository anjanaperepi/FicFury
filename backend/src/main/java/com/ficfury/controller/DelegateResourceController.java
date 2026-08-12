package com.ficfury.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.ResourceResponse;
import com.ficfury.service.ResourceService;

@RestController
@RequestMapping("/api/delegate/resources")
public class DelegateResourceController {

    private final ResourceService resourceService;

    public DelegateResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

@GetMapping
public List<ResourceResponse> getResources(
        @RequestParam Long committeeId) {

    System.out.println("===== CONTROLLER HIT =====");
    System.out.println("committeeId = " + committeeId);

    return resourceService.getApprovedResources(committeeId);
}


    
}