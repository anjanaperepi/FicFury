package com.ficfury.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ficfury.dto.CommitteeWithdrawalRequestDTO;
import com.ficfury.model.CommitteeWithdrawalRequest;
import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.model.RequestStatus;
import com.ficfury.model.Role;
import com.ficfury.model.User;
import com.ficfury.repository.CommitteeWithdrawalRequestRepository;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.repository.UserRepository;

@Service
public class CommitteeWithdrawalRequestService {


    private final CommitteeWithdrawalRequestRepository requestRepository;

    private final RegistrationRepository registrationRepository;

    private final UserRepository userRepository;


    public CommitteeWithdrawalRequestService(
            CommitteeWithdrawalRequestRepository requestRepository,
            RegistrationRepository registrationRepository,
            UserRepository userRepository
    ) {

        this.requestRepository =
                requestRepository;

        this.registrationRepository =
                registrationRepository;

        this.userRepository =
                userRepository;

    }


    // =====================================================
    // CREATE WITHDRAWAL REQUEST
    // =====================================================

    public CommitteeWithdrawalRequest createRequest(
            CommitteeWithdrawalRequestDTO request
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


        // =================================================
        // PREVENT DUPLICATE PENDING REQUEST
        // =================================================

        if (
                requestRepository
                        .existsByUser_IdAndStatus(
                                user.getId(),
                                RequestStatus.PENDING
                        )
        ) {

            throw new RuntimeException(
                    "You already have a pending withdrawal request."
            );

        }


        // =================================================
        // CREATE REQUEST
        // =================================================

        CommitteeWithdrawalRequest withdrawalRequest =
                new CommitteeWithdrawalRequest();


        withdrawalRequest.setUser(user);

        withdrawalRequest.setCommittee(
                registration.getCommittee()
        );

        withdrawalRequest.setRegistration(
                registration
        );

        withdrawalRequest.setReason(
                request.getReason()
        );

        withdrawalRequest.setStatus(
                RequestStatus.PENDING
        );


        return requestRepository.save(
                withdrawalRequest
        );

    }


    // =====================================================
    // GET MY REQUESTS
    // =====================================================

    public List<CommitteeWithdrawalRequest>
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

    public List<CommitteeWithdrawalRequest>
    getPendingRequests() {

        return requestRepository
                .findByStatus(
                        RequestStatus.PENDING
                );

    }


    // =====================================================
    // APPROVE REQUEST
    // =====================================================

    public CommitteeWithdrawalRequest approveRequest(
            Long requestId,
            String reviewComment
    ) {

        User reviewer =
                getLoggedInUser();


        CommitteeWithdrawalRequest request =
                requestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Withdrawal request not found."
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


        validateReviewer(
                request,
                reviewer
        );


        Registration registration =
                request.getRegistration();


        // =================================================
        // MAKE SURE REGISTRATION IS STILL ACTIVE
        // =================================================

        if (
                registration.getWorkflowStatus()
                        != RegistrationStatus.ACTIVE
        ) {

            throw new RuntimeException(
                    "This registration is no longer active."
            );

        }


        // =================================================
        // COMPLETE REGISTRATION
        // =================================================

        registration.setWorkflowStatus(
                RegistrationStatus.COMPLETED
        );

        registrationRepository.save(
                registration
        );


        // =================================================
        // UPDATE REQUEST
        // =================================================

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

    public CommitteeWithdrawalRequest rejectRequest(
            Long requestId,
            String reviewComment
    ) {

        User reviewer =
                getLoggedInUser();


        CommitteeWithdrawalRequest request =
                requestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Withdrawal request not found."
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


        validateReviewer(
                request,
                reviewer
        );


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
    // REVIEWER VALIDATION
    // =====================================================

    private void validateReviewer(
            CommitteeWithdrawalRequest request,
            User reviewer
    ) {

        if (
                reviewer.getRole() ==
                Role.ADMIN
        ) {

            return;

        }


        if (
                reviewer.getRole() !=
                Role.CHAIR
        ) {

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

}