package com.ficfury.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ficfury.dto.CommitteeChangeRequestDTO;
import com.ficfury.model.Committee;
import com.ficfury.model.CommitteeChangeRequest;
import com.ficfury.model.RequestStatus;
import com.ficfury.model.Role;
import com.ficfury.model.User;
import com.ficfury.repository.CommitteeChangeRequestRepository;
import com.ficfury.repository.CommitteeRepository;
import com.ficfury.repository.UserRepository;

@Service
public class CommitteeChangeRequestService {


    private final CommitteeChangeRequestRepository requestRepository;

    private final CommitteeRepository committeeRepository;

    private final UserRepository userRepository;


    public CommitteeChangeRequestService(
            CommitteeChangeRequestRepository requestRepository,
            CommitteeRepository committeeRepository,
            UserRepository userRepository
    ) {

        this.requestRepository =
                requestRepository;

        this.committeeRepository =
                committeeRepository;

        this.userRepository =
                userRepository;

    }


    // =====================================================
    // CREATE REQUEST
    // =====================================================

    public CommitteeChangeRequest createRequest(
            CommitteeChangeRequestDTO dto
    ) {

        User user =
                getLoggedInUser();


        // =================================================
        // ONLY CHAIRS CAN SUBMIT
        // =================================================

        if (user.getRole() != Role.CHAIR) {

            throw new RuntimeException(
                    "Only chairs can submit committee change requests."
            );

        }


        // =================================================
        // VALIDATE COMMITTEE ID
        // =================================================

        if (dto.getCommitteeId() == null) {

            throw new RuntimeException(
                    "Committee ID is required."
            );

        }


        Committee committee =
                committeeRepository
                        .findById(dto.getCommitteeId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Committee not found."
                                )
                        );


        // =================================================
        // VERIFY CHAIR OWNS THIS COMMITTEE
        // =================================================

        boolean isChairOfCommittee =
                committee.getChairpersonEmail() != null &&
                committee.getChairpersonEmail()
                        .equalsIgnoreCase(user.getEmail());


        if (!isChairOfCommittee) {

            throw new RuntimeException(
                    "You are not the chair of this committee."
            );

        }


        // =================================================
        // PREVENT DUPLICATE PENDING REQUEST
        // =================================================

        if (
                requestRepository
                        .existsByCommitteeIdAndStatus(
                                committee.getId(),
                                RequestStatus.PENDING
                        )
        ) {

            throw new RuntimeException(
                    "This committee already has a pending change request."
            );

        }


        // =================================================
        // VALIDATE REQUIRED FIELDS
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


        if (
                dto.getChangeReason() == null ||
                dto.getChangeReason().isBlank()
        ) {

            throw new RuntimeException(
                    "Please provide a reason for the requested changes."
            );

        }


        // =================================================
        // CREATE REQUEST
        // =================================================

        CommitteeChangeRequest request =
                new CommitteeChangeRequest();


        request.setUser(user);

        request.setCommittee(committee);


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


        request.setChangeReason(
                dto.getChangeReason().trim()
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

    public List<CommitteeChangeRequest>
    getMyRequests() {

        User user =
                getLoggedInUser();


        return requestRepository
                .findByUserOrderByCreatedAtDesc(
                        user
                );

    }


    // =====================================================
    // ADMIN — GET PENDING
    // =====================================================

    public List<CommitteeChangeRequest>
    getPendingRequests() {

        requireAdmin();


        return requestRepository
                .findByStatusOrderByCreatedAtDesc(
                        RequestStatus.PENDING
                );

    }


    // =====================================================
    // ADMIN — APPROVE
    // =====================================================

    public CommitteeChangeRequest approveRequest(
            Long requestId,
            String reviewComment
    ) {

        User reviewer =
                getLoggedInUser();


        requireAdmin();


        CommitteeChangeRequest request =
                requestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Committee change request not found."
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


        Committee committee =
                request.getCommittee();


        // =================================================
        // APPLY REQUESTED CHANGES
        // =================================================

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


        committeeRepository.save(
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

    public CommitteeChangeRequest rejectRequest(
            Long requestId,
            String reviewComment
    ) {

        User reviewer =
                getLoggedInUser();


        requireAdmin();


        CommitteeChangeRequest request =
                requestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Committee change request not found."
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
    // ADMIN CHECK
    // =====================================================

    private void requireAdmin() {

        User user =
                getLoggedInUser();


        if (
                user.getRole() != Role.ADMIN
        ) {

            throw new RuntimeException(
                    "Only administrators can review committee change requests."
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
