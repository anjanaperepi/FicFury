package com.ficfury.debate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.debate.entity.ResolutionClause;

public interface ResolutionClauseRepository
        extends JpaRepository<ResolutionClause, Long> {

    List<ResolutionClause>
    findByResolution_IdAndActiveTrueOrderByClauseNumberAsc(Long resolutionId);

    void deleteByResolution_Id(Long resolutionId);

}