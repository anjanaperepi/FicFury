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
import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.model.ResourceVisibility;
import com.ficfury.service.EmailNotificationService;

import com.ficfury.repository.RegistrationRepository;

import java.util.HashSet;
import java.util.Set;

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

    private final RegistrationRepository registrationRepository;

    private final EmailNotificationService emailNotificationService;
        
public ResourceService(
        ResourceRepository resourceRepository,
        CommitteeRepository committeeRepository,
        UserRepository userRepository,
        FileStorageService fileStorageService,
        ResourceMapper resourceMapper,
        RegistrationRepository registrationRepository,
        EmailNotificationService emailNotificationService) {

    this.resourceRepository = resourceRepository;
    this.committeeRepository = committeeRepository;
    this.userRepository = userRepository;
    this.fileStorageService = fileStorageService;
    this.resourceMapper = resourceMapper;
    this.registrationRepository = registrationRepository;
        this.emailNotificationService = emailNotificationService;
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

/*
 * Default to PUBLIC when visibility
 * is not supplied.
 */
ResourceVisibility visibility =
        request.getVisibility();

if (visibility == null) {
    visibility = ResourceVisibility.PUBLIC;
}

resource.setVisibility(visibility);


/*
 * PRIVATE resources require selected
 * recipients.
 */
if (
        visibility == ResourceVisibility.PRIVATE
) {

    if (
            request.getRecipientRegistrationIds() == null ||
            request.getRecipientRegistrationIds().isEmpty()
    ) {

        throw new IllegalArgumentException(
                "Private resources must have at least one recipient."
        );
    }


    Set<Registration> recipients =
            new HashSet<>();


    for (
            Long registrationId :
            request.getRecipientRegistrationIds()
    ) {

        Registration registration =
                registrationRepository
                        .findById(registrationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recipient registration not found."
                                )
                        );


        /*
         * Recipient must belong to the
         * same committee as the resource.
         */
        if (
                registration.getCommittee() == null ||
                !registration.getCommittee()
                        .getId()
                        .equals(committee.getId())
        ) {

            throw new IllegalArgumentException(
                    "Recipient does not belong to the selected committee."
            );
        }


        /*
         * Only approved/active registrations
         * should receive private resources.
         */
        if (
                registration.getWorkflowStatus() !=
                        RegistrationStatus.ACTIVE
        ) {

            throw new IllegalArgumentException(
                    "Recipient is not an active delegate."
            );
        }


        recipients.add(registration);
    }


    resource.setRecipients(recipients);
}


Resource saved =
        resourceRepository.save(resource);

emailNotificationService.sendAdminNotification(
        "New FIC FURY Resource Submission",
        "A new resource has been submitted for admin review.\n\n"
        + "Submitted By: " + user.getFullName() + "\n"
        + "Username: " + user.getUsername() + "\n"
        + "Email: " + user.getEmail() + "\n\n"
        + "Committee: " + committee.getName() + "\n"
        + "Resource Title: " + request.getTitle() + "\n"
        + "Category: " + request.getCategory() + "\n"
        + "Description: " + request.getDescription() + "\n"
        + "Visibility: " + visibility + "\n"
        + "Request ID: " + saved.getId() + "\n\n"
        + "The resource is awaiting admin review."
);

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

public List<ResourceResponse> getApprovedResources(
        Long committeeId,
        String email) {

    Committee committee =
            committeeRepository.findById(committeeId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Committee not found"
                            )
                    );


    User user =
            userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "User not found"
                            )
                    );


    Registration registration =
            registrationRepository
                    .findByUser_IdAndCommittee_IdAndWorkflowStatus(
                            user.getId(),
                            committeeId,
                            RegistrationStatus.ACTIVE
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Active registration not found"
                            )
                    );


    return resourceRepository
            .findByCommitteeAndStatus(
                    committee,
                    ResourceStatus.APPROVED
            )
            .stream()
            .filter(resource -> {

                /*
                 * PUBLIC resources are available
                 * to everyone in the committee.
                 */
                if (
                        resource.getVisibility() ==
                        ResourceVisibility.PUBLIC
                ) {

                    return true;
                }


                /*
                 * PRIVATE resources are available
                 * only to selected registrations.
                 */
                return resource.getRecipients()
                        .contains(registration);

            })
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

    User user =
            userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "User not found"
                            )
                    );


    Resource resourceEntity =
            resourceRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Resource not found"
                            )
                    );


    /*
     * =====================================================
     * ACCESS CONTROL
     * =====================================================
     *
     * The uploader / Chair always has access.
     */
    if (
            resourceEntity.getUploadedBy()
                    .getId()
                    .equals(user.getId())
    ) {

        // Access granted.

    }

    /*
     * PUBLIC resources are available to users
     * belonging to the resource's committee.
     */
    else if (
            resourceEntity.getVisibility() ==
            ResourceVisibility.PUBLIC
    ) {

        boolean activeParticipant =
                registrationRepository
                        .findByUser_IdAndCommittee_IdAndWorkflowStatus(
                                user.getId(),
                                resourceEntity.getCommittee()
                                        .getId(),
                                RegistrationStatus.ACTIVE
                        )
                        .isPresent();

        if (!activeParticipant) {

            throw new RuntimeException(
                    "Access denied"
            );
        }
    }

    /*
     * PRIVATE resources are available only
     * to their selected recipients.
     */
    else {

        Registration registration =
                registrationRepository
                        .findByUser_IdAndCommittee_IdAndWorkflowStatus(
                                user.getId(),
                                resourceEntity.getCommittee()
                                        .getId(),
                                RegistrationStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Access denied"
                                )
                        );


        if (
                !resourceEntity.getRecipients()
                        .contains(registration)
        ) {

            throw new RuntimeException(
                    "Access denied"
            );
        }
    }


    /*
     * =====================================================
     * FILE DELIVERY
     * =====================================================
     */

    if (
            resourceEntity.getFilePath() == null ||
            resourceEntity.getFilePath().isBlank()
    ) {

        throw new RuntimeException(
                "No file attached to this resource"
        );
    }


    org.springframework.core.io.Resource file =
            fileStorageService.loadFileAsResource(
                    resourceEntity.getFilePath()
            );


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