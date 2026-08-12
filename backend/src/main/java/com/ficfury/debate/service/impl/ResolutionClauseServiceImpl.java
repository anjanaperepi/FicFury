package com.ficfury.debate.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ficfury.debate.dto.response.ResolutionClauseResponse;
import com.ficfury.debate.entity.Resolution;
import com.ficfury.debate.entity.ResolutionClause;
import com.ficfury.debate.parser.ResolutionClauseParser;
import com.ficfury.debate.repository.ResolutionClauseRepository;
import com.ficfury.debate.repository.ResolutionRepository;
import com.ficfury.debate.service.ResolutionClauseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResolutionClauseServiceImpl
        implements ResolutionClauseService {

    private final ResolutionClauseRepository clauseRepository;

    private final ResolutionRepository resolutionRepository;

    private final ResolutionClauseParser clauseParser;

    @Override
    @Transactional(readOnly = true)
    public List<ResolutionClauseResponse> getClauses(Long resolutionId) {

        return clauseRepository
                .findByResolution_IdAndActiveTrueOrderByClauseNumberAsc(resolutionId)
                .stream()
                .map(this::toResponse)
                .toList();

    }

    @Override
    @Transactional(readOnly = true)
    public ResolutionClauseResponse getClause(Long clauseId) {

        ResolutionClause clause =
                clauseRepository.findById(clauseId)
                        .orElseThrow(() ->
                                new RuntimeException("Clause not found."));

        return toResponse(clause);

    }

    @Override
    public List<ResolutionClauseResponse> regenerateClauses(
            Long resolutionId) {

        Resolution resolution =
                resolutionRepository.findById(resolutionId)
                        .orElseThrow(() ->
                                new RuntimeException("Resolution not found."));

        clauseRepository.deleteByResolution_Id(resolutionId);

        List<ResolutionClause> clauses =
                clauseParser.generateClauses(resolution);

        clauseRepository.saveAll(clauses);

        return clauses
                .stream()
                .map(this::toResponse)
                .toList();

    }

    @Override
    public void deleteClauses(Long resolutionId) {

        clauseRepository.deleteByResolution_Id(resolutionId);

    }

    private ResolutionClauseResponse toResponse(
            ResolutionClause clause) {

        ResolutionClauseResponse response =
                new ResolutionClauseResponse();

        response.setId(clause.getId());

        response.setClauseNumber(
                clause.getClauseNumber());

        response.setClauseType(
                clause.getClauseType());

        response.setContent(
                clause.getContent());

        return response;

    }

}
