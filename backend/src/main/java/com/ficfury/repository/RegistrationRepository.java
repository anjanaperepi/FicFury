package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.model.ApprovalStatus;
import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

public interface RegistrationRepository
        extends JpaRepository<Registration, Long> {

    List<Registration> findByUser_Id(Long userId);
                Optional<Registration> findFirstByUser_Id(Long userId);
   List<Registration> findByWorkflowStatus(
        RegistrationStatus workflowStatus
);

    List<Registration> findTop5ByOrderByRegisteredAtDesc();

    long countByWorkflowStatus(
        RegistrationStatus workflowStatus
);

    // =====================================================
    // Chair Dashboard
    // =====================================================

    List<Registration> findByCommittee_Id(Long committeeId);

    long countByCommittee_Id(Long committeeId);

    List<Registration> findTop5ByCommittee_IdOrderByRegisteredAtDesc(
            Long committeeId
    );

    List<Registration> findByUser_IdAndWorkflowStatusIn(
        Long userId,
        List<RegistrationStatus> workflowStatuses
);

List<Registration> findByWorkflowStatusAndAdminApproval(
        RegistrationStatus workflowStatus,
        ApprovalStatus adminApproval
);

List<Registration> findByCommittee_IdAndWorkflowStatus(
        Long committeeId,
        RegistrationStatus workflowStatus
);
boolean existsByCharacter_IdAndWorkflowStatusIn(
        Long characterId,
        List<RegistrationStatus> statuses
);

    boolean existsByUser_IdAndCommittee_Id(
            Long userId,
            Long committeeId
    );
long countByCommittee_IdAndWorkflowStatus(
        Long committeeId,
        RegistrationStatus workflowStatus
);

    Optional<Registration> findByCharacter_Id(Long characterId);
@Transactional
@Modifying
@Query("DELETE FROM Registration r WHERE r.character.id = :characterId")
void deleteByCharacterId(@Param("characterId") Long characterId);
@Transactional
@Modifying
@Query("DELETE FROM Registration r WHERE r.committee.id = :committeeId")
void deleteByCommitteeId(@Param("committeeId") Long committeeId);

@Query("""
SELECT r
FROM Registration r
WHERE r.committee.chairpersonEmail = :email
ORDER BY r.registeredAt DESC
""")
List<Registration> findChairRegistrations(
        @Param("email") String email);


@Query("""
SELECT r
FROM Registration r
WHERE r.committee.chairpersonEmail = :email
AND r.workflowStatus = com.ficfury.model.RegistrationStatus.PENDING_CHAIR
ORDER BY r.registeredAt DESC
""")
List<Registration> findPendingChairRegistrations(
        @Param("email") String email);
    

}
