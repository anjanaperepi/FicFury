package com.ficfury.controller;

import com.ficfury.dto.ResourceResponse;
import com.ficfury.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/resources")
@RequiredArgsConstructor
public class AdminResourceController {

    private final ResourceService resourceService;

    /**
     * Get all uploaded resources
     */
    @GetMapping
    public List<ResourceResponse> getAllResources() {
        return resourceService.getAllResources();
    }

    /**
     * Approve a resource
     */
    @PutMapping("/{id}/approve")
    public ResourceResponse approveResource(
            @PathVariable Long id) {

        return resourceService.approveResource(id);
    }

    /**
     * Reject a resource
     */
    @PutMapping("/{id}/reject")
    public ResourceResponse rejectResource(
            @PathVariable Long id,
            @RequestParam String feedback) {

        return resourceService.rejectResource(id, feedback);
    }

    /**
     * Delete a resource
     */
    @DeleteMapping("/{id}")
    public void deleteResource(
            @PathVariable Long id) {

        resourceService.deleteResource(id);
    }
}