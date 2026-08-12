package com.ficfury.service;

import com.ficfury.dto.ResourceRequest;
import com.ficfury.dto.ResourceResponse;
import com.ficfury.model.Committee;
import com.ficfury.model.Resource;
import com.ficfury.model.ResourceStatus;
import com.ficfury.model.User;
import com.ficfury.repository.CommitteeRepository;
import com.ficfury.repository.ResourceRepository;
import com.ficfury.repository.UserRepository;
import com.ficfury.util.FileStorageService;
import com.ficfury.util.ResourceMapper;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

@Service
public class ResourceService {
    private final ResourceMapper resourceMapper;
    private final ResourceRepository resourceRepository;

    private final CommitteeRepository committeeRepository;

    private final UserRepository userRepository;

    private final FileStorageService fileStorageService;

public ResourceService(
        ResourceRepository resourceRepository,
        CommitteeRepository committeeRepository,
        UserRepository userRepository,
        FileStorageService fileStorageService,
        ResourceMapper resourceMapper) {

    this.resourceRepository = resourceRepository;
    this.committeeRepository = committeeRepository;
    this.userRepository = userRepository;
    this.fileStorageService = fileStorageService;
    this.resourceMapper = resourceMapper;
}

    /**
     * Chair uploads a new resource
     */
    public ResourceResponse uploadResource(
            ResourceRequest request,
            MultipartFile file,
            String email) throws IOException {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        Committee committee = committeeRepository
                .findById(request.getCommitteeId())
                .orElseThrow(() ->
                        new RuntimeException("Committee not found."));

        String storedFileName = null;

        String originalFileName = null;

        String fileType = null;

        if (file != null && !file.isEmpty()) {

            storedFileName =
                    fileStorageService.storeFile(file);

            originalFileName =
                    file.getOriginalFilename();

            fileType =
                    file.getContentType();
        }

        Resource resource = new Resource();

        resource.setTitle(request.getTitle());

        resource.setDescription(request.getDescription());

        resource.setCategory(request.getCategory());

        resource.setCommittee(committee);

        resource.setUploadedBy(user);

        resource.setFileName(originalFileName);

        resource.setFilePath(storedFileName);

        resource.setFileType(fileType);

        resource.setExternalLink(
                request.getExternalLink());

        resource.setVersion(1);

        resource.setStatus(
                ResourceStatus.PENDING);

       Resource saved = resourceRepository.save(resource);

return resourceMapper.toResponse(saved);
    }

    /**
     * Chair views own uploaded resources
     */
public List<ResourceResponse> getResourcesByChair(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    return resourceRepository.findByUploadedBy(user)
            .stream()
            .map(resourceMapper::toResponse)
            .toList();
}

    /**
     * Admin views all resources
     */
public List<ResourceResponse> getAllResources() {

    return resourceRepository.findAll()
            .stream()
            .map(resourceMapper::toResponse)
            .toList();
}

    /**
     * Delegate views approved resources
     * for one committee
     */
public List<ResourceResponse> getApprovedResources(Long committeeId) {

    Committee committee = committeeRepository.findById(committeeId)
            .orElseThrow(() ->
                    new RuntimeException("Committee not found"));

    return resourceRepository
            .findByCommitteeAndStatus(
                    committee,
                    ResourceStatus.APPROVED)
            .stream()
            .map(resourceMapper::toResponse)
            .toList();
}

    /**
     * Admin approves resource
     */
public ResourceResponse approveResource(Long id) {

    Resource resource = resourceRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Resource not found"));

    resource.setStatus(ResourceStatus.APPROVED);

    resource.setAdminFeedback(null);

    return resourceMapper.toResponse(
            resourceRepository.save(resource));
}

    /**
     * Admin rejects resource
     */
public ResourceResponse rejectResource(
        Long id,
        String feedback) {

    Resource resource = resourceRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Resource not found"));

    resource.setStatus(ResourceStatus.REJECTED);

    resource.setAdminFeedback(feedback);

    return resourceMapper.toResponse(
            resourceRepository.save(resource));
}

    /**
     * Delete resource
     */
    public void deleteResource(Long resourceId) {

    Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() ->
                    new RuntimeException("Resource not found."));

    if (resource.getFilePath() != null) {
        fileStorageService.deleteFile(resource.getFilePath());
    }

    resourceRepository.delete(resource);
}

public void deleteResource(
        Long resourceId,
        String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() ->
                    new RuntimeException("Resource not found"));

    if (!resource.getUploadedBy().getId().equals(user.getId())) {
        throw new RuntimeException("Access denied");
    }

    if (resource.getFilePath() != null) {
        fileStorageService.deleteFile(resource.getFilePath());
    }

    resourceRepository.delete(resource);
}


    public ResourceResponse getResource(
        Long id,
        String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Resource resource = resourceRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Resource not found"));

    if (!resource.getUploadedBy().getId().equals(user.getId())) {
        throw new RuntimeException("Access denied");
    }

    return resourceMapper.toResponse(resource);
}
public ResourceResponse updateResource(
        Long id,
        ResourceRequest request,
        MultipartFile file,
        String email) throws IOException {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Resource resource = resourceRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Resource not found"));

    if (!resource.getUploadedBy().getId().equals(user.getId())) {
        throw new RuntimeException("Access denied");
    }

    if (resource.getStatus() != ResourceStatus.PENDING) {
        throw new RuntimeException(
                "Only pending resources can be edited.");
    }

    Committee committee = committeeRepository.findById(
            request.getCommitteeId())
            .orElseThrow(() ->
                    new RuntimeException("Committee not found"));

    resource.setTitle(request.getTitle());
    resource.setDescription(request.getDescription());
    resource.setCommittee(committee);
    resource.setCategory(request.getCategory());
    resource.setExternalLink(request.getExternalLink());

    if (file != null && !file.isEmpty()) {

        if (resource.getFilePath() != null) {
            fileStorageService.deleteFile(resource.getFilePath());
        }

        String stored = fileStorageService.storeFile(file);

        resource.setFilePath(stored);
        resource.setFileName(file.getOriginalFilename());
        resource.setFileType(file.getContentType());
    }

    resource.setVersion(resource.getVersion() + 1);

    return resourceMapper.toResponse(
            resourceRepository.save(resource));
}
public ResponseEntity<org.springframework.core.io.Resource> downloadResource(
        Long id,
        String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Resource resourceEntity = resourceRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Resource not found"));

                    if (!resourceEntity.getUploadedBy().getId().equals(user.getId())) {
    throw new RuntimeException("Access denied");
}

    org.springframework.core.io.Resource file =
        fileStorageService.loadFileAsResource(
                resourceEntity.getFilePath());

    return ResponseEntity.ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" +
                            resourceEntity.getFileName() +
                            "\""
            )
            .body(file);
}
}