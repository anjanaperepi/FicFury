package com.ficfury.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import com.ficfury.dto.ResourceRequest;
import com.ficfury.dto.ResourceResponse;
import com.ficfury.service.ResourceService;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.core.io.Resource;



@RestController
@RequestMapping("/api/chair/resources")
public class ChairResourceController {

    private final ResourceService resourceService;

    public ChairResourceController(
            ResourceService resourceService
    ) {

        this.resourceService = resourceService;

    }

@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResourceResponse upload(
        @RequestPart("resource") ResourceRequest request,
        @RequestPart("file") MultipartFile file,
        Authentication authentication) throws IOException {


           System.out.println("=== Upload endpoint reached ===");     

    return resourceService.uploadResource(
            request,
            file,
            authentication.getName());
}
@GetMapping
public List<ResourceResponse> getMyResources(
        Authentication authentication) {

    return resourceService.getResourcesByChair(
            authentication.getName());
}
@GetMapping("/{id}")
public ResourceResponse getResource(
        @PathVariable Long id,
        Authentication authentication) {

    return resourceService.getResource(
            id,
            authentication.getName());
}
@GetMapping("/{id}/download")
public ResponseEntity<Resource> download(
        @PathVariable Long id,
        Authentication authentication) throws IOException {

    return resourceService.downloadResource(
            id,
            authentication.getName());
}
@PutMapping(
        value="/{id}",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public ResourceResponse update(
        @PathVariable Long id,
        @RequestPart("resource") ResourceRequest request,
        @RequestPart(value="file", required=false)
        MultipartFile file,
        Authentication authentication)
        throws IOException {

    return resourceService.updateResource(
            id,
            request,
            file,
            authentication.getName());
}
@DeleteMapping("/{id}")
public void delete(
        @PathVariable Long id,
        Authentication authentication) {

    resourceService.deleteResource(
            id,
            authentication.getName());
}
}