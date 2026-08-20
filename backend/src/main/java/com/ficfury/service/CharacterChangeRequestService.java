package com.ficfury.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ficfury.dto.CharacterChangeRequestDTO;
import com.ficfury.model.Character;
import com.ficfury.model.CharacterChangeRequest;
import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.model.RequestStatus;
import com.ficfury.model.User;
import com.ficfury.model.Role;
import com.ficfury.repository.CharacterRepository;
import com.ficfury.repository.CharacterChangeRequestRepository;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.repository.UserRepository;

@Service
public class CharacterChangeRequestService {


    private final CharacterChangeRequestRepository requestRepository;

    private final RegistrationRepository registrationRepository;

    private final CharacterRepository characterRepository;

    private final UserRepository userRepository;


    public CharacterChangeRequestService(
            CharacterChangeRequestRepository requestRepository,
            RegistrationRepository registrationRepository,
            CharacterRepository characterRepository,
            UserRepository userRepository
    ) {

        this.requestRepository =
                requestRepository;

        this.registrationRepository =
                registrationRepository;

        this.characterRepository =
                characterRepository;

        this.userRepository =
                userRepository;

    }


    // =====================================================
    // CREATE REQUEST
    // =====================================================

    public CharacterChangeRequest createRequest(
            CharacterChangeRequestDTO request
    ) {

        User user =
                getLoggedInUser();


        Registration registration =
                registrationRepository
                        .findByUser_IdAndWorkflowStatus(
                                user.getId(),
                                RegistrationStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "You do not have an active committee registration."
                                )
                        );


        Character requestedCharacter =
                characterRepository
                        .findById(
                                request.getRequestedCharacterId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Requested character not found."
                                )
                        );


        // =================================================
        // CHARACTER MUST BELONG TO SAME COMMITTEE
        // =================================================

        if (
                !requestedCharacter
                        .getCommittee()
                        .getId()
                        .equals(
                                registration
                                        .getCommittee()
                                        .getId()
                        )
        ) {

            throw new RuntimeException(
                    "You can only request a character from your current committee."
            );

        }


        // =================================================
        // SAME CHARACTER
        // =================================================

        if (
                requestedCharacter
                        .getId()
                        .equals(
                                registration
                                        .getCharacter()
                                        .getId()
                        )
        ) {

            throw new RuntimeException(
                    "You are already assigned to this character."
            );

        }


        // =================================================
        // PENDING REQUEST CHECK
        // =================================================

        if (
                requestRepository
                        .existsByUser_IdAndStatus(
                                user.getId(),
                                RequestStatus.PENDING
                        )
        ) {

            throw new RuntimeException(
                    "You already have a pending character change request."
            );

        }


        // =================================================
        // CHARACTER AVAILABILITY
        // =================================================

        if (
                registrationRepository
                        .existsByCharacter_IdAndWorkflowStatusIn(
                                requestedCharacter.getId(),
                                List.of(
                                        RegistrationStatus.PENDING_ADMIN,
                                        RegistrationStatus.PENDING_CHAIR,
                                        RegistrationStatus.ACTIVE
                                )
                        )
        ) {

            throw new RuntimeException(
                    "This character is already assigned."
            );

        }


        // =================================================
        // CREATE REQUEST
        // =================================================

        CharacterChangeRequest changeRequest =
                new CharacterChangeRequest();


        changeRequest.setUser(user);

        changeRequest.setCommittee(
                registration.getCommittee()
        );

        changeRequest.setCurrentCharacter(
                registration.getCharacter()
        );

        changeRequest.setRequestedCharacter(
                requestedCharacter
        );

        changeRequest.setReason(
                request.getReason()
        );

        changeRequest.setStatus(
                RequestStatus.PENDING
        );


        return requestRepository.save(
                changeRequest
        );

    }


    // =====================================================
    // GET USER REQUESTS
    // =====================================================

    public List<CharacterChangeRequest>
    getMyRequests() {

        User user =
                getLoggedInUser();

        return requestRepository
                .findByUser_Id(
                        user.getId()
                );

    }


    // =====================================================
    // GET PENDING REQUESTS
    // =====================================================

    public List<CharacterChangeRequest>
    getPendingRequests() {

        return requestRepository
                .findByStatus(
                        RequestStatus.PENDING
                );

    }


    // =====================================================
    // APPROVE REQUEST
    // =====================================================

    public CharacterChangeRequest approveRequest(
            Long requestId,
            String reviewComment
    ) {

        User reviewer =
                getLoggedInUser();

        


        CharacterChangeRequest request =
                requestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Character change request not found."
                                )
                        );

        validateChairOwnsRequest(
        request,
        reviewer
);


        if (
                request.getStatus()
                        != RequestStatus.PENDING
        ) {

            throw new RuntimeException(
                    "This request has already been reviewed."
            );

        }


        Registration registration =
                registrationRepository
                        .findByUser_IdAndWorkflowStatus(
                                request.getUser().getId(),
                                RegistrationStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Active registration not found."
                                )
                        );


        Character newCharacter =
                request.getRequestedCharacter();


        if (
                registrationRepository
                        .existsByCharacter_IdAndWorkflowStatusIn(
                                newCharacter.getId(),
                                List.of(
                                        RegistrationStatus.PENDING_ADMIN,
                                        RegistrationStatus.PENDING_CHAIR,
                                        RegistrationStatus.ACTIVE
                                )
                        )
        ) {

            throw new RuntimeException(
                    "The requested character is no longer available."
            );

        }


        // ================================================
        // UPDATE ACTUAL REGISTRATION
        // ================================================

        registration.setCharacter(
                newCharacter
        );

        registrationRepository.save(
                registration
        );


        // ================================================
        // UPDATE REQUEST
        // ================================================

        request.setStatus(
                RequestStatus.APPROVED
        );

        request.setReviewer(
                reviewer
        );

        request.setReviewedAt(
                LocalDateTime.now()
        );

        request.setReviewComment(
                reviewComment
        );


        return requestRepository.save(
                request
        );

    }


    // =====================================================
    // REJECT REQUEST
    // =====================================================

    public CharacterChangeRequest rejectRequest(
            Long requestId,
            String reviewComment
    ) {

        User reviewer =
                getLoggedInUser();


        CharacterChangeRequest request =
                requestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Character change request not found."
                                )
                        );


        if (
                request.getStatus()
                        != RequestStatus.PENDING
        ) {

            throw new RuntimeException(
                    "This request has already been reviewed."
            );

        }


        request.setStatus(
                RequestStatus.REJECTED
        );

        request.setReviewer(
                reviewer
        );

        request.setReviewedAt(
                LocalDateTime.now()
        );

        request.setReviewComment(
                reviewComment
        );


        return requestRepository.save(
                request
        );

    }


    // =====================================================
    // CURRENT USER
    // =====================================================

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        String username =
                authentication.getName();


        return userRepository
                .findByEmail(username)
                .or(() ->
                        userRepository
                                .findByUsername(username)
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found."
                        )
                );

    }
private void validateChairOwnsRequest(
        CharacterChangeRequest request,
        User reviewer
) {

    if (reviewer.getRole() == Role.ADMIN) {
        return;
    }

    if (reviewer.getRole() != Role.CHAIR) {

        throw new RuntimeException(
                "Only admins or committee chairs can review requests."
        );

    }

    if (
        request.getCommittee()
            .getChairpersonEmail() == null ||
        !request.getCommittee()
            .getChairpersonEmail()
            .equalsIgnoreCase(
                reviewer.getEmail()
            )
    ) {

        throw new RuntimeException(
                "You are not assigned to this committee."
        );

    }

}



}

