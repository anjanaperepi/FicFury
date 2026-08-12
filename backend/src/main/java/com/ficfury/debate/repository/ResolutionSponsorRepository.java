package com.ficfury.debate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.debate.entity.ResolutionSponsor;

public interface ResolutionSponsorRepository
        extends JpaRepository<ResolutionSponsor, Long> {

    List<ResolutionSponsor> findByResolutionId(Long resolutionId);

    Optional<ResolutionSponsor> findByResolutionIdAndDelegateId(
            Long resolutionId,
            Long delegateId);

        long countByResolution_Id(Long resolutionId);

}