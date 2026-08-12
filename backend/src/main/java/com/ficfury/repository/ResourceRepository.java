package com.ficfury.repository;

import com.ficfury.model.Committee;
import com.ficfury.model.Resource;
import com.ficfury.model.ResourceStatus;
import com.ficfury.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByCommittee(Committee committee);

    List<Resource> findByUploadedBy(User uploadedBy);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByCommitteeAndStatus(
            Committee committee,
            ResourceStatus status
    );

}