package com.ficfury.service;


import com.ficfury.model.User;
import com.ficfury.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.ficfury.model.Certificate;
import com.ficfury.model.CertificateStatus;
import com.ficfury.repository.CertificateRepository;
import com.ficfury.dto.CertificateGenerationRequest;
import com.ficfury.dto.CertificateEligibleRecipientDTO;
import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.SessionStatus;
import com.ficfury.debate.repository.DebateSessionRepository;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateServiceImpl
        implements CertificateService {

private final CertificateRepository certificateRepository;

private final RegistrationRepository registrationRepository;

private final CertificatePdfService certificatePdfService;

private final UserRepository userRepository;

private final DebateSessionRepository debateSessionRepository;

public CertificateServiceImpl(
        CertificateRepository certificateRepository,
        RegistrationRepository registrationRepository,
        CertificatePdfService certificatePdfService,
        UserRepository userRepository,
        DebateSessionRepository debateSessionRepository
) {

    this.certificateRepository =
            certificateRepository;

    this.registrationRepository =
            registrationRepository;

    this.certificatePdfService =
            certificatePdfService;

    this.userRepository =
            userRepository;

    this.debateSessionRepository =
            debateSessionRepository;
}



@Override
public List<CertificateEligibleRecipientDTO>
getEligibleRecipients(Long committeeId) {

    if (committeeId == null) {

        throw new IllegalArgumentException(
                "Committee ID is required."
        );
    }


    /*
     * =====================================================
     * CERTIFICATE SESSION CHECK
     * =====================================================
     *
     * Certificates can only be prepared after the
     * committee's latest debate session has STOPPED.
     */

    DebateSession latestSession =
            debateSessionRepository
                    .findTopByCommittee_IdOrderByCreatedAtDesc(
                            committeeId
                    )
                    .orElseThrow(
                            () ->
                                    new IllegalStateException(
                                            "No debate session exists for this committee."
                                    )
                    );


    if (
            latestSession.getStatus()
                    != SessionStatus.STOPPED
    ) {

        throw new IllegalStateException(
                "Certificates can only be generated after the debate session has stopped."
        );
    }


    /*
     * =====================================================
     * FIND ACTIVE DELEGATE REGISTRATIONS
     * =====================================================
     */

    List<Registration> registrations =
            registrationRepository
                    .findByCommittee_IdAndWorkflowStatus(
                            committeeId,
                            RegistrationStatus.ACTIVE
                    );


    return registrations
            .stream()
            .filter(
                    registration ->
                            registration.getUser() != null
            )
            .filter(
                    registration ->
                            registration.getCommittee() != null
            )
            .filter(
                    registration ->
                            registration.getCharacter() != null
            )
            .map(
                    registration ->
                            new CertificateEligibleRecipientDTO(

                                    registration
                                            .getUser()
                                            .getId(),

                                    registration
                                            .getUser()
                                            .getFullName(),

                                    registration
                                            .getCharacter()
                                            .getId(),

                                    registration
                                            .getCharacter()
                                            .getName(),

                                    registration
                                            .getCommittee()
                                            .getId(),

                                    registration
                                            .getCommittee()
                                            .getName(),

                                    registration.getId()
                            )
            )
            .toList();
}

    @Override
    public Certificate getCertificateById(
            Long id
    ) {

        return certificateRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Certificate not found."
                        )
                );
    }
@Override
public List<Certificate> getMyCertificates() {

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();


    if (
            authentication == null ||
            !authentication.isAuthenticated()
    ) {

        throw new RuntimeException(
                "User is not authenticated."
        );
    }


    String username =
            authentication.getName();


    User user =
            userRepository
                    .findByEmail(username)
                    .or(() ->
                            userRepository
                                    .findByUsername(username)
                    )
                    .orElseThrow(
                            () ->
                                    new RuntimeException(
                                            "Logged-in user not found."
                                    )
                    );


    return certificateRepository
            .findByRecipientId(
                    user.getId()
            );
}

@Override
public boolean isMyCertificateEligible() {

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();


    if (
            authentication == null ||
            !authentication.isAuthenticated()
    ) {

        return false;
    }


    String username =
            authentication.getName();


    User user =
            userRepository
                    .findByEmail(username)
                    .or(() ->
                            userRepository
                                    .findByUsername(username)
                    )
                    .orElse(null);


    if (user == null) {

        return false;
    }


    /*
     * Find the delegate's active registration.
     */

List<Registration> registrations =
        registrationRepository
                .findByUser_IdAndWorkflowStatusIn(
                        user.getId(),
                        List.of(
                                RegistrationStatus.ACTIVE
                        )
                );


    if (
            registrations == null ||
            registrations.isEmpty()
    ) {

        return false;
    }


    /*
     * The delegate should normally have one active
     * committee registration.
     *
     * Check the registered committee's latest
     * debate session.
     */

    for (
            Registration registration :
            registrations
    ) {

        if (
                registration.getCommittee() == null ||
                registration.getCommittee().getId() == null
        ) {

            continue;
        }


        Long committeeId =
                registration
                        .getCommittee()
                        .getId();


        Optional<DebateSession> latestSession =
                debateSessionRepository
                        .findTopByCommittee_IdOrderByCreatedAtDesc(
                                committeeId
                        );


        if (
                latestSession.isPresent() &&
                latestSession
                        .get()
                        .getStatus()
                        == SessionStatus.STOPPED
        ) {

            return true;
        }
    }


    return false;
}

@Override
public Certificate getMyCertificateForDownload(
        Long certificateId
) {

    if (certificateId == null) {

        throw new IllegalArgumentException(
                "Certificate ID is required."
        );
    }


    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();


    if (
            authentication == null ||
            !authentication.isAuthenticated()
    ) {

        throw new RuntimeException(
                "User is not authenticated."
        );
    }


    String username =
            authentication.getName();


    User user =
            userRepository
                    .findByEmail(username)
                    .or(() ->
                            userRepository
                                    .findByUsername(username)
                    )
                    .orElseThrow(
                            () ->
                                    new RuntimeException(
                                            "Logged-in user not found."
                                    )
                    );


    Certificate certificate =
            certificateRepository
                    .findById(certificateId)
                    .orElseThrow(
                            () ->
                                    new RuntimeException(
                                            "Certificate not found."
                                    )
                    );


    /*
     * SECURITY CHECK
     *
     * A delegate can only download a certificate
     * belonging to their own user account.
     */

    if (
            certificate.getRecipientId() == null ||
            !certificate
                    .getRecipientId()
                    .equals(user.getId())
    ) {

        throw new RuntimeException(
                "You are not authorized to download this certificate."
        );
    }


    return certificate;
}
    @Override
public List<Certificate> generateCertificates(
        CertificateGenerationRequest request
) {

    if (request == null) {
        throw new IllegalArgumentException(
                "Certificate generation request is required."
        );
    }

    DebateSession latestSession =
        debateSessionRepository
                .findTopByCommittee_IdOrderByCreatedAtDesc(
                        request.getCommitteeId()
                )
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "No debate session exists for this committee."
                                )
                );


if (
        latestSession.getStatus()
                != SessionStatus.STOPPED
) {

    throw new IllegalStateException(
            "Certificates cannot be generated until the debate session has stopped."
    );
}



    if (request.getCommitteeId() == null) {
        throw new IllegalArgumentException(
                "Committee ID is required."
        );
    }


    if (
            request.getEventName() == null ||
            request.getEventName().isBlank()
    ) {
        throw new IllegalArgumentException(
                "Event name is required."
        );
    }


    if (request.getCertificateType() == null) {
        throw new IllegalArgumentException(
                "Certificate type is required."
        );
    }


    if (
            request.getRegistrationIds() == null ||
            request.getRegistrationIds().isEmpty()
    ) {
        throw new IllegalArgumentException(
                "At least one recipient must be selected."
        );
    }


    List<Certificate> certificates =
            new ArrayList<>();


    for (
            Long registrationId :
            request.getRegistrationIds()
    ) {

        if (registrationId == null) {
            continue;
        }


        /*
         * Retrieve the registration from the database.
         *
         * We do NOT trust recipient information
         * supplied by the frontend.
         */

        Registration registration =
                registrationRepository
                        .findById(registrationId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Registration not found: "
                                                + registrationId
                                )
                        );


        /*
         * Only ACTIVE registrations can receive
         * certificates.
         */

        if (
                registration.getWorkflowStatus()
                        != RegistrationStatus.ACTIVE
        ) {

            throw new RuntimeException(
                    "Registration "
                            + registrationId
                            + " is not active."
            );
        }


        /*
         * Make sure the registration actually belongs
         * to the committee selected by the Admin.
         */

        if (
                registration.getCommittee() == null ||
                registration.getCommittee().getId() == null ||
                !registration
                        .getCommittee()
                        .getId()
                        .equals(
                                request.getCommitteeId()
                        )
        ) {

            throw new RuntimeException(
                    "Registration "
                            + registrationId
                            + " does not belong to the selected committee."
            );
        }


        /*
         * A registration must have a user and character
         * before a certificate can be generated.
         */

        if (registration.getUser() == null) {

            throw new RuntimeException(
                    "Registration "
                            + registrationId
                            + " has no associated user."
            );
        }


        if (registration.getCharacter() == null) {

            throw new RuntimeException(
                    "Registration "
                            + registrationId
                            + " has no assigned character."
            );
        }


        Long recipientId =
                registration
                        .getUser()
                        .getId();


        Long committeeId =
                registration
                        .getCommittee()
                        .getId();


        /*
         * Prevent duplicate certificates.
         */

        boolean alreadyExists =
                certificateRepository
                        .existsByRecipientIdAndCommitteeIdAndCertificateType(
                                recipientId,
                                committeeId,
                                request.getCertificateType()
                        );


        if (alreadyExists) {

            throw new RuntimeException(
                    "A "
                            + request
                                    .getCertificateType()
                            + " certificate already exists for "
                            + registration
                                    .getUser()
                                    .getFullName()
                            + " in this committee."
            );
        }


        /*
         * Create certificate record.
         */

        Certificate certificate =
                new Certificate();


        certificate.setCertificateNumber(
                generateCertificateNumber()
        );


        certificate.setRecipientId(
                recipientId
        );


        certificate.setRecipientName(
                registration
                        .getUser()
                        .getFullName()
        );


        certificate.setCharacterName(
                registration
                        .getCharacter()
                        .getName()
        );


        certificate.setCommitteeId(
                committeeId
        );


        certificate.setCommitteeName(
                registration
                        .getCommittee()
                        .getName()
        );


        certificate.setCertificateType(
                request.getCertificateType()
        );


        certificate.setEventName(
                request.getEventName()
        );


        certificate.setIssuedAt(
                LocalDateTime.now()
        );


        certificate.setStatus(
                CertificateStatus.GENERATED
        );


        certificate.setCreatedAt(
                LocalDateTime.now()
        );


        certificates.add(
                certificate
        );
    }


    /*
     * Save all certificates together.
     */

for (
        Certificate certificate :
        certificates
) {

    try {

        String filePath =
                certificatePdfService
                        .generateCertificatePdf(
                                certificate
                        );

        certificate.setFilePath(
                filePath
        );

    } catch (IOException e) {

        throw new RuntimeException(
                "Failed to generate PDF for certificate "
                        + certificate
                                .getCertificateNumber(),
                e
        );
    }
}


return certificateRepository.saveAll(
        certificates
);
}

private String generateCertificateNumber() {

    String year =
            String.valueOf(
                    LocalDateTime
                            .now()
                            .getYear()
            );

    String randomPart =
            UUID
                    .randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();

    return "FFIC-"
            + year
            + "-"
            + randomPart;
}
    @Override
    public Certificate getCertificateByNumber(
            String certificateNumber
    ) {

        return certificateRepository
                .findByCertificateNumber(
                        certificateNumber
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Certificate not found."
                        )
                );
    }


    @Override
    public List<Certificate> getCertificates() {

        return certificateRepository.findAll();
    }
}