package com.ficfury.debate.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ficfury.debate.dto.request.CreateResolutionRequest;
import com.ficfury.debate.dto.request.UpdateResolutionRequest;
import com.ficfury.debate.dto.response.ResolutionResponse;
import com.ficfury.debate.dto.response.ResolutionResultResponse;
import com.ficfury.debate.entity.AmendmentStatus;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.ActivityType;
import com.ficfury.debate.enums.SessionStatus;
import com.ficfury.debate.entity.Resolution;
import com.ficfury.debate.entity.ResolutionClause;
import com.ficfury.debate.entity.ResolutionSponsor;
import com.ficfury.debate.entity.ResolutionStatus;
import com.ficfury.debate.entity.VoteType;
import com.ficfury.debate.mapper.ResolutionMapper;
import com.ficfury.debate.parser.ResolutionClauseParser;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.debate.repository.ResolutionClauseRepository;
import com.ficfury.debate.repository.ResolutionRepository;
import com.ficfury.debate.repository.ResolutionSignatoryRepository;
import com.ficfury.debate.repository.ResolutionSponsorRepository;
import com.ficfury.debate.repository.AmendmentRepository;
import com.ficfury.debate.service.ActivityLogService;
import com.ficfury.debate.service.ResolutionService;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.model.User;
import com.ficfury.repository.UserRepository;
import com.ficfury.debate.repository.VoteRepository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
@Service
public class ResolutionServiceImpl implements ResolutionService {

    private final ResolutionRepository resolutionRepository;
    private final DebateSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final ResolutionMapper resolutionMapper;
    private final ResolutionSponsorRepository sponsorRepository;
    private final ResolutionSignatoryRepository signatoryRepository;
    private final VoteRepository voteRepository;
    private final ResolutionClauseRepository clauseRepository;
    private final AmendmentRepository amendmentRepository;
    private final RegistrationRepository registrationRepository;

private final ResolutionClauseParser clauseParser;
@Autowired
private ActivityLogService activityLogService;
public ResolutionServiceImpl(
        ResolutionRepository resolutionRepository,
        DebateSessionRepository sessionRepository,
        UserRepository userRepository,
        ResolutionMapper resolutionMapper,
        ResolutionSponsorRepository sponsorRepository
        , ResolutionSignatoryRepository signatoryRepository, 
        VoteRepository voteRepository, 
        ResolutionClauseRepository clauseRepository,
         ResolutionClauseParser clauseParser,
         AmendmentRepository amendmentRepository,
         RegistrationRepository registrationRepository) {

    this.resolutionRepository = resolutionRepository;
    this.sessionRepository = sessionRepository;
    this.userRepository = userRepository;
    this.resolutionMapper = resolutionMapper;
    this.sponsorRepository = sponsorRepository;
    this.signatoryRepository = signatoryRepository;
    this.voteRepository = voteRepository;
    this.clauseRepository = clauseRepository;
    this.clauseParser = clauseParser;
    this.amendmentRepository = amendmentRepository;
    this.registrationRepository = registrationRepository;
}
private User getCurrentUser() {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new RuntimeException("Authenticated user not found."));

}

    @Override
    public ResolutionResponse createResolution(
            CreateResolutionRequest request) {

        DebateSession session = sessionRepository.findById(
                request.getSessionId())
                .orElseThrow(() ->
                        new RuntimeException("Session not found."));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Resolution can only be submitted during an active session.");
        }

        User delegate = userRepository.findById(
                request.getDelegateId())
                .orElseThrow(() ->
                        new RuntimeException("Delegate not found."));

        Resolution resolution = new Resolution();

        resolution.setSession(session);
        resolution.setSubmittedBy(delegate);
        resolution.setTitle(request.getTitle());
        resolution.setContent(request.getContent());
        resolution.setStatus(ResolutionStatus.DRAFT);
        resolution.setSubmittedAt(LocalDateTime.now());

        Resolution savedResolution =
                resolutionRepository.save(resolution);
        
        ResolutionSponsor sponsor = new ResolutionSponsor();

sponsor.setResolution(savedResolution);
sponsor.setDelegate(delegate);
sponsor.setSponsoredAt(LocalDateTime.now());

sponsorRepository.save(sponsor);

        return resolutionMapper.toResponse(savedResolution);
    }

    @Override
    public ResolutionResponse updateResolution(
            Long resolutionId,
            UpdateResolutionRequest request) {

        Resolution resolution =
                resolutionRepository.findById(resolutionId)
                        .orElseThrow(() ->
                                new RuntimeException("Resolution not found."));

        if (resolution.getStatus() != ResolutionStatus.DRAFT) {
            throw new IllegalStateException(
                    "Only draft resolutions can be updated.");
        }

        resolution.setTitle(request.getTitle());
        resolution.setContent(request.getContent());

        Resolution updated =
                resolutionRepository.save(resolution);

        return resolutionMapper.toResponse(updated);
    }

@Override
public ResolutionResponse approveResolution(Long resolutionId) {

    Resolution resolution =
            resolutionRepository.findById(resolutionId)
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

    if (resolution.getStatus() != ResolutionStatus.SUBMITTED) {
        throw new IllegalStateException(
                "Only submitted resolutions can be approved.");
    }
    long sponsorCount =
        sponsorRepository.countByResolution_Id(
                resolution.getId());

long signatoryCount =
        signatoryRepository.countByResolution_Id(
                resolution.getId());
System.out.println("===== APPROVAL CHECK =====");
System.out.println("Sponsors: " + sponsorCount);
System.out.println("Required Sponsors: " + resolution.getSession().getRequiredSponsors());

System.out.println("Signatories: " + signatoryCount);
System.out.println("Required Signatories: " + resolution.getSession().getRequiredSignatories());

System.out.println("==========================");
if (sponsorCount
        < resolution.getSession().getRequiredSponsors()
        ||
    signatoryCount
        < resolution.getSession().getRequiredSignatories()) {

    throw new IllegalStateException(
            "Resolution has not met the required number of sponsors and signatories."
    );

}
    resolution.setStatus(ResolutionStatus.APPROVED);
activityLogService.log(
    resolution.getSession(),
    getCurrentUser(),
    ActivityType.RESOLUTION_APPROVED,
    "Resolution Approved",
    "Resolution '" + resolution.getTitle() + "' was approved by the Chair."
);
    resolution.setReviewedAt(LocalDateTime.now());


    resolution = resolutionRepository.save(resolution);
    clauseRepository.deleteByResolution_Id(
        resolution.getId());

List<ResolutionClause> clauses =
        clauseParser.generateClauses(resolution);

clauseRepository.saveAll(clauses);

    return resolutionMapper.toResponse(resolution);
}

@Override
public ResolutionResponse rejectResolution(Long resolutionId) {

    Resolution resolution =
            resolutionRepository.findById(resolutionId)
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

    if (resolution.getStatus() != ResolutionStatus.SUBMITTED) {
        throw new IllegalStateException(
                "Only submitted resolutions can be rejected.");
    }

    resolution.setStatus(ResolutionStatus.REJECTED);
    activityLogService.log(
    resolution.getSession(),
    getCurrentUser(),
    ActivityType.RESOLUTION_REJECTED,
    "Resolution Rejected",
    "Resolution '" + resolution.getTitle() + "' was rejected by the Chair."
);
    resolution.setReviewedAt(LocalDateTime.now());

    resolution = resolutionRepository.save(resolution);

    return resolutionMapper.toResponse(resolution);
}

    @Override
    public void deleteResolution(Long resolutionId) {

        Resolution resolution =
                resolutionRepository.findById(resolutionId)
                        .orElseThrow(() ->
                                new RuntimeException("Resolution not found."));

        if (resolution.getStatus() != ResolutionStatus.DRAFT) {
            throw new IllegalStateException(
                    "Only draft resolutions can be deleted.");
        }

        resolutionRepository.delete(resolution);
    }

    @Override
    public ResolutionResponse getResolution(Long resolutionId) {

        Resolution resolution =
                resolutionRepository.findById(resolutionId)
                        .orElseThrow(() ->
                                new RuntimeException("Resolution not found."));

        return resolutionMapper.toResponse(resolution);
    }

    @Override
    public List<ResolutionResponse> getSessionResolutions(
            Long sessionId) {

        return resolutionRepository
                .findBySessionId(sessionId)
                .stream()
                .map(resolutionMapper::toResponse)
                .toList();
    }

    @Override
    public List<ResolutionResponse> getApprovedResolutions(
            Long sessionId) {

        return resolutionRepository
                .findBySessionIdAndStatus(
                        sessionId,
                        ResolutionStatus.APPROVED)
                .stream()
                .map(resolutionMapper::toResponse)
                .toList();
    }
 

    @Override
public ResolutionResponse submitResolution(Long resolutionId) {

    Resolution resolution =
            resolutionRepository.findById(resolutionId)
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

    if (resolution.getStatus() != ResolutionStatus.DRAFT) {
        throw new IllegalStateException(
                "Only draft resolutions can be submitted.");
    }

    resolution.setStatus(ResolutionStatus.SUBMITTED);

    resolution.setSubmittedAt(LocalDateTime.now());

    resolution = resolutionRepository.save(resolution);


    activityLogService.log(

                resolution.getSession(),

                resolution.getSubmittedBy(),

                ActivityType.RESOLUTION_SUBMITTED,

                "Resolution Submitted",

                "Resolution '" + resolution.getTitle()
                        + "' was submitted for chair review."

        );
    return resolutionMapper.toResponse(resolution);
}

@Override
public ResolutionResponse markPassed(Long resolutionId) {

    Resolution resolution =
            resolutionRepository.findById(resolutionId)
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

    if (resolution.getStatus() != ResolutionStatus.APPROVED) {
        throw new IllegalStateException(
                "Resolution must be approved before voting.");
    }

    resolution.setStatus(ResolutionStatus.PASSED);

    resolution = resolutionRepository.save(resolution);

    return resolutionMapper.toResponse(resolution);
}

@Override
public ResolutionResponse markFailed(Long resolutionId) {

    Resolution resolution =
            resolutionRepository.findById(resolutionId)
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

    if (resolution.getStatus() != ResolutionStatus.APPROVED) {
        throw new IllegalStateException(
                "Resolution must be approved before voting.");
    }

    resolution.setStatus(ResolutionStatus.FAILED);

    resolution = resolutionRepository.save(resolution);

    return resolutionMapper.toResponse(resolution);
}

@Override
public ResolutionResponse openVoting(Long resolutionId) {

    Resolution resolution = resolutionRepository.findById(resolutionId)
            .orElseThrow(() ->
                    new RuntimeException("Resolution not found."));

if(resolution.getStatus()
        != ResolutionStatus.AMENDMENTS_CLOSED){

    throw new IllegalStateException(
        "Amendments must be closed before voting opens.");

}

    resolution.setStatus(ResolutionStatus.VOTING);

    resolution = resolutionRepository.save(resolution);
activityLogService.log(
    resolution.getSession(),
    getCurrentUser(),
    ActivityType.VOTING_OPENED,
    "Voting Opened",
    "Voting opened for '" + resolution.getTitle() + "'."
);
    return resolutionMapper.toResponse(resolution);
}

@Override
@Transactional
public ResolutionResponse closeVoting(Long resolutionId) {

    Resolution resolution = resolutionRepository.findById(resolutionId)
            .orElseThrow(() ->
                    new RuntimeException("Resolution not found."));

    if (resolution.getStatus() != ResolutionStatus.VOTING) {
        throw new IllegalStateException(
                "Voting is not currently open.");
    }

    long yesVotes =
            voteRepository.countByResolutionIdAndVoteType(
                    resolutionId,
                    VoteType.YES);

    long noVotes =
            voteRepository.countByResolutionIdAndVoteType(
                    resolutionId,
                    VoteType.NO);

    long totalVotes = yesVotes + noVotes;

    if (totalVotes == 0) {
        throw new IllegalStateException(
                "No votes have been cast.");
    }

    if (yesVotes > noVotes) {

        resolution.setStatus(
                ResolutionStatus.PASSED);

    }
    else {

        resolution.setStatus(
                ResolutionStatus.FAILED);

    }

    resolution.setReviewedAt(
            LocalDateTime.now());

    resolutionRepository.save(resolution);
ActivityType resultType =
        resolution.getStatus() == ResolutionStatus.PASSED
                ? ActivityType.RESOLUTION_PASSED
                : ActivityType.RESOLUTION_FAILED;

activityLogService.log(
    resolution.getSession(),
    getCurrentUser(),
    resultType,
    "Voting Closed",
    "Resolution '" + resolution.getTitle() +
    "' " + resolution.getStatus().name().toLowerCase() + "."
);
    return resolutionMapper.toResponse(
            resolution);


}

@Override
@Transactional
public ResolutionResponse openAmendments(Long resolutionId) {

    Resolution resolution =
            resolutionRepository.findById(resolutionId)
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

    if (resolution.getStatus() != ResolutionStatus.APPROVED) {

        throw new IllegalStateException(
                "Only approved resolutions may enter the amendment phase.");

    }

    resolution.setStatus(
            ResolutionStatus.AMENDMENT_OPEN);


    resolution.setReviewedAt(
            LocalDateTime.now());

    resolutionRepository.save(resolution);
activityLogService.log(
    resolution.getSession(),
    getCurrentUser(),
    ActivityType.AMENDMENTS_OPENED,
    "Amendments Opened",
    "Amendment phase opened for '" + resolution.getTitle() + "'."
);
    return resolutionMapper.toResponse(resolution);

}
@Override
@Transactional
public ResolutionResponse closeAmendments(Long resolutionId) {

    Resolution resolution =
            resolutionRepository.findById(resolutionId)
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

    if (resolution.getStatus() != ResolutionStatus.AMENDMENT_OPEN) {

        throw new IllegalStateException(
                "Amendments are not currently open.");

    }

resolution.setStatus(
        ResolutionStatus.AMENDMENTS_CLOSED);

    resolutionRepository.save(resolution);
activityLogService.log(
    resolution.getSession(),
    getCurrentUser(),
    ActivityType.AMENDMENTS_CLOSED,
    "Amendments Closed",
    "Amendment phase closed for '" + resolution.getTitle() + "'."
);
    return resolutionMapper.toResponse(resolution);

}

@Override
@Transactional(readOnly = true)
public ResolutionResultResponse getResults(Long resolutionId) {

    Resolution resolution =
            resolutionRepository.findById(resolutionId)
                    .orElseThrow(() ->
                            new RuntimeException("Resolution not found."));

    long yesVotes =
            voteRepository.countByResolutionIdAndVoteType(
                    resolutionId,
                    VoteType.YES);

    long noVotes =
            voteRepository.countByResolutionIdAndVoteType(
                    resolutionId,
                    VoteType.NO);


    long totalVotes =
            yesVotes + noVotes ;

long totalDelegates =
    registrationRepository.countByCommittee_IdAndWorkflowStatus(
        resolution.getSession().getCommittee().getId(),
        RegistrationStatus.ACTIVE
    );

    double participation = 0;

    if (totalDelegates > 0) {

        participation =
                (totalVotes * 100.0) / totalDelegates;

    }

    long approvedAmendments =
            amendmentRepository
                    .countByResolution_IdAndStatus(
                            resolutionId,
                            AmendmentStatus.APPROVED);

    long rejectedAmendments =
            amendmentRepository
                    .countByResolution_IdAndStatus(
                            resolutionId,
                            AmendmentStatus.REJECTED);

    ResolutionResultResponse response =
            new ResolutionResultResponse();

    response.setResolutionId(
            resolution.getId());

    response.setTitle(
            resolution.getTitle());

    response.setStatus(
            resolution.getStatus().name());

    response.setYesVotes(
            yesVotes);

    response.setNoVotes(
            noVotes);

    response.setTotalVotes(
            totalVotes);

    response.setTotalDelegates(
            totalDelegates);

    response.setParticipationPercentage(
            participation);

    response.setApprovedAmendments(
            approvedAmendments);

    response.setRejectedAmendments(
            rejectedAmendments);

    return response;
}
}