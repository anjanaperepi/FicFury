package com.ficfury.debate.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ficfury.debate.dto.request.AddSignatoryRequest;
import com.ficfury.debate.dto.request.AddSponsorRequest;
import com.ficfury.debate.dto.response.SignatoryResponse;
import com.ficfury.debate.dto.response.SponsorResponse;
import com.ficfury.debate.entity.Resolution;
import com.ficfury.debate.entity.ResolutionSignatory;
import com.ficfury.debate.entity.ResolutionSponsor;
import com.ficfury.debate.entity.ResolutionStatus;
import com.ficfury.debate.mapper.ResolutionParticipationMapper;
import com.ficfury.debate.repository.ResolutionRepository;
import com.ficfury.debate.repository.ResolutionSignatoryRepository;
import com.ficfury.debate.repository.ResolutionSponsorRepository;
import com.ficfury.debate.service.ResolutionParticipationService;
import com.ficfury.model.User;
import com.ficfury.repository.UserRepository;

@Service
public class ResolutionParticipationServiceImpl
        implements ResolutionParticipationService {

    private final ResolutionRepository resolutionRepository;
    private final ResolutionSponsorRepository sponsorRepository;
    private final ResolutionSignatoryRepository signatoryRepository;
    private final UserRepository userRepository;
    private final ResolutionParticipationMapper mapper;

    public ResolutionParticipationServiceImpl(
            ResolutionRepository resolutionRepository,
            ResolutionSponsorRepository sponsorRepository,
            ResolutionSignatoryRepository signatoryRepository,
            UserRepository userRepository,
            ResolutionParticipationMapper mapper) {

        this.resolutionRepository = resolutionRepository;
        this.sponsorRepository = sponsorRepository;
        this.signatoryRepository = signatoryRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }
        @Override
    public SponsorResponse addSponsor(AddSponsorRequest request) {

        Resolution resolution =
                resolutionRepository.findById(request.getResolutionId())
                        .orElseThrow(() ->
                                new RuntimeException("Resolution not found."));

System.out.println("================================");
System.out.println("Resolution ID: " + resolution.getId());
System.out.println("Resolution Status: " + resolution.getStatus());
System.out.println("================================");

if (resolution.getStatus() != ResolutionStatus.SUBMITTED) {
    throw new IllegalStateException(
            "Sponsors can only be added to submitted resolutions.");
}

        User delegate =
                userRepository.findById(request.getDelegateId())
                        .orElseThrow(() ->
                                new RuntimeException("Delegate not found."));

        if (sponsorRepository
                .findByResolutionIdAndDelegateId(
                        resolution.getId(),
                        delegate.getId())
                .isPresent()) {

            throw new IllegalStateException(
                    "Delegate is already a sponsor.");
        }

        ResolutionSponsor sponsor = new ResolutionSponsor();

        sponsor.setResolution(resolution);
        sponsor.setDelegate(delegate);
        sponsor.setSponsoredAt(LocalDateTime.now());

        sponsor = sponsorRepository.save(sponsor);

        return mapper.toSponsorResponse(sponsor);
    }


        @Override
    public SignatoryResponse addSignatory(
            AddSignatoryRequest request) {

                System.out.println("=== addSignatory() reached ===");
System.out.println("Resolution: " + request.getResolutionId());
System.out.println("Delegate: " + request.getDelegateId());

        Resolution resolution =
                resolutionRepository.findById(request.getResolutionId())
                        .orElseThrow(() ->
                                new RuntimeException("Resolution not found."));

System.out.println("================================");
System.out.println("Resolution ID: " + resolution.getId());
System.out.println("Resolution Status: " + resolution.getStatus());
System.out.println("================================");


if (resolution.getStatus() != ResolutionStatus.SUBMITTED) {
    throw new IllegalStateException(
            "Signatories can only be added to submitted resolutions.");
}

        User delegate =
                userRepository.findById(request.getDelegateId())
                        .orElseThrow(() ->
                                new RuntimeException("Delegate not found."));

        if (signatoryRepository
                .findByResolutionIdAndDelegateId(
                        resolution.getId(),
                        delegate.getId())
                .isPresent()) {

            throw new IllegalStateException(
                    "Delegate is already a signatory.");
        }

        ResolutionSignatory signatory =
                new ResolutionSignatory();

        signatory.setResolution(resolution);
        signatory.setDelegate(delegate);
        signatory.setSignedAt(LocalDateTime.now());

        signatory = signatoryRepository.save(signatory);

        return mapper.toSignatoryResponse(signatory);
    }
@Override
public List<SignatoryResponse> getSignatories(Long resolutionId) {

    return signatoryRepository
            .findByResolutionId(resolutionId)
            .stream()
            .map(mapper::toSignatoryResponse)
            .toList();
}
@Override
public List<SponsorResponse> getSponsors(Long resolutionId) {

    return sponsorRepository
            .findByResolutionId(resolutionId)
            .stream()
            .map(mapper::toSponsorResponse)
            .toList();
}
@Override
public void removeSignatory(Long signatoryId) {

    ResolutionSignatory signatory =
            signatoryRepository.findById(signatoryId)
                    .orElseThrow(() ->
                            new RuntimeException("Signatory not found."));

    if (signatory.getResolution().getStatus() != ResolutionStatus.DRAFT) {
        throw new IllegalStateException(
                "Signatories cannot be removed after submission.");
    }

    signatoryRepository.delete(signatory);
}
@Override
public void removeSponsor(Long sponsorId) {

    ResolutionSponsor sponsor =
            sponsorRepository.findById(sponsorId)
                    .orElseThrow(() ->
                            new RuntimeException("Sponsor not found."));

    if (sponsor.getResolution().getStatus() != ResolutionStatus.DRAFT) {
        throw new IllegalStateException(
                "Sponsors cannot be removed after submission.");
    }

    sponsorRepository.delete(sponsor);
}

        }