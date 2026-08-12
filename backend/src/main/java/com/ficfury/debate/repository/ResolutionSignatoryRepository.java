package com.ficfury.debate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.debate.entity.ResolutionSignatory;

public interface ResolutionSignatoryRepository
        extends JpaRepository<ResolutionSignatory, Long> {

    List<ResolutionSignatory> findByResolutionId(Long resolutionId);

    Optional<ResolutionSignatory> findByResolutionIdAndDelegateId(
            Long resolutionId,
            Long delegateId);

    long countByResolution_Id(Long resolutionId);

}