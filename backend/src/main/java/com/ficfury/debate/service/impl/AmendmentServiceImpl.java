package com.ficfury.debate.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ficfury.debate.dto.request.CreateAmendmentRequest;
import com.ficfury.debate.dto.response.AmendmentResponse;
import com.ficfury.debate.entity.Amendment;
import com.ficfury.debate.entity.AmendmentStatus;
import com.ficfury.debate.entity.AmendmentType;
import com.ficfury.debate.entity.Resolution;
import com.ficfury.debate.entity.ResolutionStatus;
import com.ficfury.debate.mapper.AmendmentMapper;
import com.ficfury.debate.repository.AmendmentRepository;
import com.ficfury.debate.repository.ResolutionRepository;
import com.ficfury.debate.service.AmendmentService;
import com.ficfury.model.User;
import com.ficfury.repository.UserRepository;
import com.ficfury.debate.entity.ClauseType;
import com.ficfury.debate.entity.ResolutionClause;
import com.ficfury.debate.repository.ResolutionClauseRepository;


@Service
public class AmendmentServiceImpl implements AmendmentService {

    private final AmendmentRepository amendmentRepository;
    private final ResolutionRepository resolutionRepository;
    private final UserRepository userRepository;
    private final AmendmentMapper amendmentMapper;

    private final ResolutionClauseRepository clauseRepository;


public AmendmentServiceImpl(
        AmendmentRepository amendmentRepository,
        ResolutionRepository resolutionRepository,
        ResolutionClauseRepository clauseRepository,
        UserRepository userRepository,
        AmendmentMapper amendmentMapper) {

    this.amendmentRepository = amendmentRepository;
    this.resolutionRepository = resolutionRepository;
    this.clauseRepository = clauseRepository;
    this.userRepository = userRepository;
    this.amendmentMapper = amendmentMapper;
}



    @Override
public AmendmentResponse createAmendment(
        CreateAmendmentRequest request) {

    Resolution resolution =
            resolutionRepository.findById(request.getResolutionId())
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

if (resolution.getStatus() != ResolutionStatus.AMENDMENT_OPEN) {
    throw new IllegalStateException(
            "Amendments are not currently open for this resolution.");
}

    User delegate =
            userRepository.findById(request.getDelegateId())
                    .orElseThrow(() ->
                            new RuntimeException("Delegate not found."));

    


ResolutionClause clause =
        clauseRepository.findById(request.getClauseId())
                .orElseThrow(() ->
                        new RuntimeException("Clause not found."));

ResolutionClause insertAfterClause = null;

if (request.getAmendmentType() == AmendmentType.ADD) {

    insertAfterClause =
            clauseRepository.findById(
                    request.getInsertAfterClauseId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Insert-after clause not found."));
}
Amendment amendment = new Amendment();

amendment.setResolution(resolution);
amendment.setClause(clause);
amendment.setInsertAfterClause(insertAfterClause);
amendment.setProposedBy(delegate);
amendment.setAmendmentType(request.getAmendmentType());
amendment.setProposedText(request.getProposedText());
amendment.setStatus(AmendmentStatus.PENDING);
amendment.setProposedAt(LocalDateTime.now());

amendment = amendmentRepository.save(amendment);

return amendmentMapper.toResponse(amendment);
    
}

@Override
public AmendmentResponse approveAmendment(Long amendmentId) {

    Amendment amendment = amendmentRepository.findById(amendmentId)
            .orElseThrow(() ->
                    new RuntimeException("Amendment not found."));

    if (amendment.getStatus() != AmendmentStatus.PENDING) {
        throw new IllegalStateException(
                "Only pending amendments can be approved.");
    }

    ResolutionClause clause = amendment.getClause();

    switch (amendment.getAmendmentType()) {

        case ADD:

            List<ResolutionClause> clauses =
                    clauseRepository.findByResolution_IdAndActiveTrueOrderByClauseNumberAsc(
                            clause.getResolution().getId());

            ResolutionClause insertAfterClause =
        amendment.getInsertAfterClause();

int insertAfter =
        insertAfterClause.getClauseNumber();

            // Shift existing clause numbers
            for (ResolutionClause existingClause : clauses) {

                if (existingClause.getClauseNumber() > insertAfter) {
                    existingClause.setClauseNumber(
                            existingClause.getClauseNumber() + 1);
                }
            }

            clauseRepository.saveAll(clauses);

            ResolutionClause newClause = new ResolutionClause();

            newClause.setResolution(clause.getResolution());
            newClause.setClauseNumber(insertAfter + 1);
            newClause.setClauseType(ClauseType.OPERATIVE);
            newClause.setContent(amendment.getProposedText());
            newClause.setCreatedAt(LocalDateTime.now());

            clauseRepository.save(newClause);

            break;

        case MODIFY:

            clause.setContent(amendment.getProposedText());

            clauseRepository.save(clause);

            break;

case DELETE:

    clause.setActive(false);

    clauseRepository.save(clause);

    renumberClauses(clause.getResolution().getId());

    break;

        default:
            throw new IllegalStateException(
                    "Unsupported amendment type.");
    }

    amendment.setStatus(AmendmentStatus.APPROVED);
    amendment.setReviewedAt(LocalDateTime.now());

    amendment = amendmentRepository.save(amendment);

    return amendmentMapper.toResponse(amendment);
}

@Override
public AmendmentResponse rejectAmendment(Long amendmentId) {

    Amendment amendment =
            amendmentRepository.findById(amendmentId)
                    .orElseThrow(() ->
                            new RuntimeException("Amendment not found."));

    if (amendment.getStatus() != AmendmentStatus.PENDING) {
        throw new IllegalStateException(
                "Only pending amendments can be rejected.");
    }

    amendment.setStatus(AmendmentStatus.REJECTED);
    amendment.setReviewedAt(LocalDateTime.now());

    amendment = amendmentRepository.save(amendment);

    return amendmentMapper.toResponse(amendment);
}

@Override
public List<AmendmentResponse> getResolutionAmendments(
        Long resolutionId) {

    return amendmentRepository.findByResolution_Id(resolutionId)
            .stream()
            .map(amendmentMapper::toResponse)
            .toList();
}

@Override
public List<AmendmentResponse> getPendingAmendments(
        Long resolutionId) {

    List<Amendment> amendments =
            amendmentRepository.findAll();

    System.out.println("Found " + amendments.size() + " amendments");

    List<AmendmentResponse> responses =
            amendments.stream()
                    .filter(a ->
                            a.getResolution().getId().equals(resolutionId))
                    .filter(a ->
                            a.getStatus() == AmendmentStatus.PENDING)
                    .map(amendmentMapper::toResponse)
                    .toList();

    System.out.println("Returning " + responses.size() + " amendments");

    return responses;
}
private void renumberClauses(Long resolutionId) {

List<ResolutionClause> clauses =
    clauseRepository
        .findByResolution_IdAndActiveTrueOrderByClauseNumberAsc(
            resolutionId);

    int number = 1;

    for (ResolutionClause clause : clauses) {

        clause.setClauseNumber(number++);

    }

    clauseRepository.saveAll(clauses);
}
}


