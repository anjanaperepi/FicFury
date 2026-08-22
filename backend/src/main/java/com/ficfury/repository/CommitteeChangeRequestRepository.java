package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.model.CommitteeChangeRequest;
import com.ficfury.model.RequestStatus;
import com.ficfury.model.User;

public interface CommitteeChangeRequestRepository
        extends JpaRepository<CommitteeChangeRequest, Long> {


    /*
     * Chair's own requests
     */
    List<CommitteeChangeRequest>
    findByUserOrderByCreatedAtDesc(
        User user
    );


    /*
     * Admin: all requests by status
     */
    List<CommitteeChangeRequest>
    findByStatusOrderByCreatedAtDesc(
        RequestStatus status
    );


    /*
     * Admin: all requests
     */
    List<CommitteeChangeRequest>
    findAllByOrderByCreatedAtDesc();


    /*
     * Prevent multiple pending requests
     * for the same committee.
     */
    boolean existsByCommitteeIdAndStatus(
        Long committeeId,
        RequestStatus status
    );

}