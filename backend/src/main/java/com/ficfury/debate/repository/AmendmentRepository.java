package com.ficfury.debate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.debate.entity.Amendment;
import com.ficfury.debate.entity.AmendmentStatus;

public interface AmendmentRepository
        extends JpaRepository<Amendment, Long> {

    List<Amendment> findByResolution_Id(Long resolutionId);

    List<Amendment> findByResolution_IdAndStatus(
            Long resolutionId,
            AmendmentStatus status);
        long countByResolution_IdAndStatus(
        Long resolutionId,
        AmendmentStatus status);

}
