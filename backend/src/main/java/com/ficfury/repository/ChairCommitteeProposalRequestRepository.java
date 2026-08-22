package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.model.ChairCommitteeProposalRequest;
import com.ficfury.model.RequestStatus;

public interface ChairCommitteeProposalRequestRepository
        extends JpaRepository<
            ChairCommitteeProposalRequest,
            Long
        > {


    List<ChairCommitteeProposalRequest>
    findByUser_Id(Long userId);


    List<ChairCommitteeProposalRequest>
    findByStatus(RequestStatus status);


    boolean existsByUser_IdAndStatus(
        Long userId,
        RequestStatus status
    );

}