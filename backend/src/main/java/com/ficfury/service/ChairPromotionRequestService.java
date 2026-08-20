package com.ficfury.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ficfury.dto.ChairPromotionRequestDTO;
import com.ficfury.model.ChairPromotionRequest;
import com.ficfury.model.Committee;
import com.ficfury.model.RequestStatus;
import com.ficfury.model.Role;
import com.ficfury.model.User;
import com.ficfury.repository.ChairPromotionRequestRepository;
import com.ficfury.repository.CommitteeRepository;
import com.ficfury.repository.UserRepository;

@Service
public class ChairPromotionRequestService {


    private final ChairPromotionRequestRepository requestRepository;

    private final CommitteeRepository committeeRepository;

    private final CommitteeService committeeService;

    private final UserRepository userRepository;


    public ChairPromotionRequestService(
            ChairPromotionRequestRepository requestRepository,
            CommitteeRepository committeeRepository,
            CommitteeService committeeService,
            UserRepository userRepository
    ) {

        this.requestRepository =
                requestRepository;

        this.committeeRepository =
                committeeRepository;

        this.committeeService =
                committeeService;

        this.userRepository =
                userRepository;

    }


    // =====================================================
    // CREATE PROPOSAL
    // =====================================================

    public ChairPromotionRequest createRequest(
            ChairPromotionRequestDTO dto
    ) {

        User user =
                getLoggedInUser();


        // =================================================
        // ONLY DELEGATES CAN APPLY
        // =================================================

        if (user.getRole() != Role.DELEGATE) {

            throw new RuntimeException(
                    "Only delegates can submit a chair proposal."
            );

        }


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
                    "You already have a pending chair proposal."
            );

        }


        // =================================================
        // VALIDATE COMMITTEE NAME
        // =================================================

        if (
                dto.getCommitteeName() == null ||
                dto.getCommitteeName().isBlank()
        ) {

            throw new RuntimeException(
                    "Committee name is required."
            );

        }


        if (
                committeeRepository
                        .existsByNameIgnoreCase(
                                dto.getCommitteeName()
                        )
        ) {

            throw new RuntimeException(
                    "A committee with this name already exists."
            );

        }


        // =================================================
        // VALIDATE REQUIRED SCHEDULE
        // =================================================

        if (
                dto.getDate() == null ||
                dto.getDate().isBlank()
        ) {

            throw new RuntimeException(
                    "Date is required."
            );

        }


        if (
                dto.getTime() == null ||
                dto.getTime().isBlank()
        ) {

            throw new RuntimeException(
                    "Time is required."
            );

        }


        // =================================================
        // CREATE REQUEST
        // =================================================

        ChairPromotionRequest request =
                new ChairPromotionRequest();


        request.setUser(user);

        request.setCommitteeName(
                dto.getCommitteeName().trim()
        );

        request.setCategory(
                dto.getCategory()
        );

        request.setDescription(
                dto.getDescription()
        );

        request.setDate(
                dto.getDate()
        );

        request.setTime(
                dto.getTime()
        );

        request.setMode(
                dto.getMode()
        );

        request.setVenue(
                dto.getVenue()
        );

        request.setMeetingLink(
                dto.getMeetingLink()
        );

        request.setProposalReason(
                dto.getProposalReason()
        );

        request.setStatus(
                RequestStatus.PENDING
        );


        return requestRepository.save(
                request
        );

    }


    // =====================================================
    // GET MY REQUESTS
    // =====================================================

    public List<ChairPromotionRequest>
    getMyRequests() {

        User user =
                getLoggedInUser();

        return requestRepository
                .findByUser_Id(
                        user.getId()
                );

    }


    // =====================================================
    // ADMIN — GET PENDING
    // =====================================================

    public List<ChairPromotionRequest>
    getPendingRequests() {

        requireAdmin();

        return requestRepository
                .findByStatus(
                        RequestStatus.PENDING
                );

    }


    // =====================================================
    // ADMIN — APPROVE
    // =====================================================

    @Transactional
    public ChairPromotionRequest approveRequest(
            Long requestId,
            String reviewComment
    ) {

        User reviewer =
                getLoggedInUser();


        requireAdmin();


        ChairPromotionRequest request =
                requestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Chair proposal not found."
                                )
                        );


        if (
                request.getStatus()
                        != RequestStatus.PENDING
        ) {

            throw new RuntimeException(
                    "This proposal has already been reviewed."
            );

        }


        User applicant =
                request.getUser();


        // =================================================
        // VERIFY APPLICANT IS STILL A DELEGATE
        // =================================================

        if (
                applicant.getRole()
                        != Role.DELEGATE
        ) {

            throw new RuntimeException(
                    "Applicant is no longer a delegate."
            );

        }


        // =================================================
        // DOUBLE-CHECK COMMITTEE NAME
        // =================================================

        if (
                committeeRepository
                        .existsByNameIgnoreCase(
                                request.getCommitteeName()
                        )
        ) {

            throw new RuntimeException(
                    "A committee with this name already exists."
            );

        }


        // =================================================
        // PROMOTE USER
        // =================================================

        applicant.setRole(
                Role.CHAIR
        );

        userRepository.save(
                applicant
        );


        // =================================================
        // CREATE COMMITTEE
        // =================================================

        Committee committee =
                new Committee();


        committee.setName(
                request.getCommitteeName()
        );

        committee.setCategory(
                request.getCategory()
        );

        committee.setDescription(
                request.getDescription()
        );

        committee.setDate(
                request.getDate()
        );

        committee.setTime(
                request.getTime()
        );

        committee.setMode(
                request.getMode()
        );

        committee.setVenue(
                request.getVenue()
        );

        committee.setMeetingLink(
                request.getMeetingLink()
        );

        committee.setChairpersonName(
                applicant.getUsername()
        );

        committee.setChairpersonEmail(
                applicant.getEmail()
        );


        committeeService.createCommittee(
                committee
        );


        // =================================================
        // APPROVE REQUEST
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
    // ADMIN — REJECT
    // =====================================================

    public ChairPromotionRequest rejectRequest(
            Long requestId,
            String reviewComment
    ) {

        User reviewer =
                getLoggedInUser();


        requireAdmin();


        ChairPromotionRequest request =
                requestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Chair proposal not found."
                                )
                        );


        if (
                request.getStatus()
                        != RequestStatus.PENDING
        ) {

            throw new RuntimeException(
                    "This proposal has already been reviewed."
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
    // ADMIN CHECK
    // =====================================================

    private void requireAdmin() {

        User user =
                getLoggedInUser();


        if (
                user.getRole() != Role.ADMIN
        ) {

            throw new RuntimeException(
                    "Only administrators can review chair proposals."
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