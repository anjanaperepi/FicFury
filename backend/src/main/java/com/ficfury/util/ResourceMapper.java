package com.ficfury.util;

import com.ficfury.dto.ResourceResponse;
import com.ficfury.model.Resource;
import org.springframework.stereotype.Component;

@Component
public class ResourceMapper {

    public ResourceResponse toResponse(Resource resource) {

        if (resource == null) {
            return null;
        }

        ResourceResponse response = new ResourceResponse();

        response.setId(resource.getId());
        response.setTitle(resource.getTitle());
        response.setDescription(resource.getDescription());
        response.setCategory(resource.getCategory());

        response.setFileName(resource.getFileName());
        response.setFilePath(resource.getFilePath());
        response.setFileType(resource.getFileType());

        response.setExternalLink(resource.getExternalLink());

        response.setVersion(resource.getVersion());
        response.setStatus(resource.getStatus());

        response.setAdminFeedback(resource.getAdminFeedback());

        if (resource.getCommittee() != null) {
            response.setCommitteeId(resource.getCommittee().getId());
            response.setCommitteeName(resource.getCommittee().getName());
        }

       if (resource.getUploadedBy() != null) {
    response.setUploadedBy(resource.getUploadedBy().getId());
    response.setUploadedByName(
            resource.getUploadedBy().getFullName()
    );
}

        response.setCreatedAt(resource.getCreatedAt());
        response.setUpdatedAt(resource.getUpdatedAt());

        return response;
    }

}