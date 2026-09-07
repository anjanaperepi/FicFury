package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ficfury.model.CommitteeWithdrawalRequest;
import com.ficfury.model.RequestStatus;

public interface CommitteeWithdrawalRequestRepository
        extends JpaRepository<
            CommitteeWithdrawalRequest,
            Long
        > {


    List<CommitteeWithdrawalRequest>
    findByUser_Id(Long userId);


    List<CommitteeWithdrawalRequest>
    findByCommittee_Id(Long committeeId);

    @Modifying
@Query("""
    DELETE FROM CommitteeWithdrawalRequest r
    WHERE r.registration.committee.id = :committeeId
""")
void deleteByRegistrationCommitteeId(@Param("committeeId") Long committeeId);


    List<CommitteeWithdrawalRequest>
    findByStatus(RequestStatus status);


    boolean existsByUser_IdAndStatus(
        Long userId,
        RequestStatus status
    );

}