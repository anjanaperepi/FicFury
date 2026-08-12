package com.ficfury.service;



import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ficfury.model.User;
import com.ficfury.model.Role;
import com.ficfury.repository.UserRepository;
import com.ficfury.dto.MainAnnouncementRequest;
import com.ficfury.dto.MainAnnouncementResponse;
import com.ficfury.model.MainAnnouncement;
import com.ficfury.model.MainAnnouncementStatus;
import com.ficfury.model.AnnouncementAudience;
import com.ficfury.repository.MainAnnouncementRepository;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.service.MainAnnouncementService;

import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.Comparator;

import com.ficfury.repository.CommitteeRepository;
import com.ficfury.model.Committee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class MainAnnouncementServiceImpl
        implements MainAnnouncementService {

private final MainAnnouncementRepository mainAnnouncementRepository;

private final UserRepository userRepository;

private final CommitteeRepository committeeRepository;

private final RegistrationRepository registrationRepository;

public MainAnnouncementServiceImpl(
        MainAnnouncementRepository mainAnnouncementRepository,
        UserRepository userRepository,
        CommitteeRepository committeeRepository,
        RegistrationRepository registrationRepository
) {

    this.mainAnnouncementRepository =
            mainAnnouncementRepository;

    this.userRepository =
            userRepository;

    this.committeeRepository =
            committeeRepository;

    this.registrationRepository =
            registrationRepository;
}

    // =========================================================
    // CREATE
    // =========================================================

    @Override
public MainAnnouncementResponse createAnnouncement(
        MainAnnouncementRequest request
) {

    if (request == null) {

        throw new IllegalArgumentException(
                "Announcement request cannot be null."
        );
    }


    if (request.getTitle() == null ||
            request.getTitle().trim().isEmpty()) {

        throw new IllegalArgumentException(
                "Announcement title is required."
        );
    }


    if (request.getContent() == null ||
            request.getContent().trim().isEmpty()) {

        throw new IllegalArgumentException(
                "Announcement content is required."
        );
    }


User user = getLoggedInUser();

Long committeeId = null;
String committeeName = null;

AnnouncementAudience audience =
        request.getAudience();

if (audience == null) {

    throw new IllegalArgumentException(
            "Announcement audience is required."
    );
}

if (user.getRole() == Role.CHAIR) {

    /*
     * A Chair may be assigned to multiple committees.
     *
     * The frontend supplies the committee the Chair
     * selected, but the backend verifies that the
     * Chair actually chairs that committee.
     */

    if (request.getCommitteeId() == null) {

        throw new IllegalArgumentException(
                "Please select a committee."
        );
    }


    List<Committee> chairedCommittees =
            getChairCommittees(user);


    Committee selectedCommittee =
            chairedCommittees
                    .stream()
                    .filter(
                            committee ->
                                    committee.getId()
                                            .equals(
                                                    request.getCommitteeId()
                                            )
                    )
                    .findFirst()
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "You are not authorized to announce for this committee."
                            )
                    );


    committeeId =
            selectedCommittee.getId();

    committeeName =
            selectedCommittee.getName();


    /*
     * Chairs cannot create Chairs-Only
     * announcements.
     */

    if (
            audience ==
                    AnnouncementAudience.CHAIRS_ONLY
    ) {

        throw new IllegalArgumentException(
                "Chairs cannot create Chairs-Only announcements."
        );
    }
}
else if (user.getRole() == Role.ADMIN) {

    /*
     * ADMIN:
     *
     * committeeId == null
     *      -> GLOBAL announcement
     *
     * committeeId != null
     *      -> Committee-specific announcement
     */

    if (request.getCommitteeId() != null) {

        Committee committee =
                committeeRepository
                        .findById(
                                request.getCommitteeId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Committee not found."
                                )
                        );

        committeeId =
                committee.getId();

        committeeName =
                committee.getName();
    }

}
else {

    throw new RuntimeException(
            "Only Admin and Chair can create announcements."
    );
}


    MainAnnouncement announcement =
            MainAnnouncement.builder()

                    .title(
                            request.getTitle().trim()
                    )

                    .content(
                            request.getContent().trim()
                    )

                    .committeeId(
                            committeeId
                    )

                    .committeeName(
                            committeeName
                    )

                    .createdBy(
                            user.getId()
                    )

                    .createdByName(
                            user.getFullName()
                    )

                    .status(
                            MainAnnouncementStatus.DRAFT
                    )

                    .audience(
                                audience
                        )

                    .createdAt(
                            LocalDateTime.now()
                    )

                    .updatedAt(
                            LocalDateTime.now()
                    )

                    .build();


    MainAnnouncement saved =
            mainAnnouncementRepository.save(
                    announcement
            );


    return toResponse(saved);
}


    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public MainAnnouncementResponse updateAnnouncement(
            Long id,
            MainAnnouncementRequest request
    ) {

        MainAnnouncement announcement =
                mainAnnouncementRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Announcement not found."
                                )
                        );

                User user =
                getLoggedInUser();

        validateChairOwnership(
                announcement,
                user
        );

        if (request.getAudience() == null) {

    throw new IllegalArgumentException(
            "Announcement audience is required."
    );
}
if (
        user.getRole() == Role.CHAIR &&
        request.getAudience() ==
                AnnouncementAudience.CHAIRS_ONLY
) {

    throw new IllegalArgumentException(
            "Chairs cannot create Chairs-Only announcements."
    );
}


        if (
                request.getTitle() == null ||
                request.getTitle().trim().isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "Announcement title is required."
            );
        }


        if (
                request.getContent() == null ||
                request.getContent().trim().isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "Announcement content is required."
            );
        }


        announcement.setTitle(
                request.getTitle().trim()
        );

        announcement.setContent(
                request.getContent().trim()
        );
        announcement.setAudience(
        request.getAudience()
        );
        announcement.setUpdatedAt(
                LocalDateTime.now()
        );


        MainAnnouncement saved =
                mainAnnouncementRepository.save(
                        announcement
                );


        return toResponse(saved);
    }


    // =========================================================
    // DELETE
    // =========================================================

@Override
public void deleteAnnouncement(Long id) {

    MainAnnouncement announcement =
            mainAnnouncementRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Announcement not found."
                            )
                    );


    User user = getLoggedInUser();

    validateChairOwnership(
            announcement,
            user
    );


    mainAnnouncementRepository.delete(
            announcement
    );
}

    // =========================================================
    // PUBLISH
    // =========================================================

    @Override
    public MainAnnouncementResponse publishAnnouncement(
            Long id
    ) {

        MainAnnouncement announcement =
                mainAnnouncementRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Announcement not found."
                                )
                        );

        User user = getLoggedInUser();

        validateChairOwnership(
                announcement,
                user
        );


        announcement.setStatus(
                MainAnnouncementStatus.PUBLISHED
        );

        announcement.setPublishedAt(
                LocalDateTime.now()
        );

        announcement.setUpdatedAt(
                LocalDateTime.now()
        );


        MainAnnouncement saved =
                mainAnnouncementRepository.save(
                        announcement
                );


        return toResponse(saved);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<MainAnnouncementResponse>
    getAllAnnouncements() {

        return mainAnnouncementRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET COMMITTEE ANNOUNCEMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<MainAnnouncementResponse>
    getCommitteeAnnouncements(
            Long committeeId
    ) {

        return mainAnnouncementRepository
                .findByCommitteeIdOrderByCreatedAtDesc(
                        committeeId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET PUBLISHED
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<MainAnnouncementResponse>
    getPublishedAnnouncements() {

        return mainAnnouncementRepository
                .findByStatusOrderByCreatedAtDesc(
                        MainAnnouncementStatus.PUBLISHED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

@Override
@Transactional(readOnly = true)
public List<MainAnnouncementResponse> getMyAnnouncements() {

    User user =
            getLoggedInUser();

    /*
     * =====================================================
     * ADMIN
     * =====================================================
     *
     * Admin can see every published announcement.
     */

    if (user.getRole() == Role.ADMIN) {

        return mainAnnouncementRepository
                .findByStatusOrderByCreatedAtDesc(
                        MainAnnouncementStatus.PUBLISHED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    if (user.getRole() == Role.CHAIR) {

    /*
     * A Chair may be assigned to multiple committees.
     */
    List<Committee> chairedCommittees =
            getChairCommittees(user);


    if (
            chairedCommittees == null ||
            chairedCommittees.isEmpty()
    ) {
        return new ArrayList<>();
    }


    List<MainAnnouncement> announcements =
            new ArrayList<>();


    /*
     * =====================================================
     * GLOBAL ANNOUNCEMENTS
     * =====================================================
     *
     * Chairs receive:
     *
     * - CHAIRS_ONLY
     * - CHAIRS_AND_DELEGATES
     *
     * They do NOT receive DELEGATES_ONLY.
     */

    announcements.addAll(
            mainAnnouncementRepository
                    .findByCommitteeIdIsNullAndStatusOrderByCreatedAtDesc(
                            MainAnnouncementStatus.PUBLISHED
                    )
                    .stream()
                    .filter(this::isVisibleToChair)
                    .toList()
    );


    /*
     * =====================================================
     * COMMITTEE ANNOUNCEMENTS
     * =====================================================
     *
     * Load announcements for EVERY committee
     * this Chair is assigned to.
     */

    for (
            Committee committee :
            chairedCommittees
    ) {

        if (committee == null ||
            committee.getId() == null) {
            continue;
        }


        announcements.addAll(
                mainAnnouncementRepository
                        .findByCommitteeIdAndStatusOrderByCreatedAtDesc(
                                committee.getId(),
                                MainAnnouncementStatus.PUBLISHED
                        )
                        .stream()
                        .filter(this::isVisibleToChair)
                        .toList()
        );
    }


    /*
     * =====================================================
     * REMOVE DUPLICATES + SORT
     * =====================================================
     */

    return announcements
            .stream()
            .distinct()
            .sorted(
                    Comparator.comparing(
                            MainAnnouncement::getCreatedAt,
                            Comparator.nullsLast(
                                    Comparator.reverseOrder()
                            )
                    )
            )
            .map(this::toResponse)
            .toList();
}

    /*
     * =====================================================
     * DELEGATE
     * =====================================================
     *
     * Only ACTIVE registrations count as membership.
     */

    if (user.getRole() == Role.DELEGATE) {

        List<Registration> registrations =
                registrationRepository
                        .findByUser_IdAndWorkflowStatusIn(
                                user.getId(),
                                List.of(
                                        RegistrationStatus.ACTIVE
                                )
                        );


        Set<Long> committeeIds =
                new HashSet<>();


        for (Registration registration :
                registrations) {

            if (registration.getCommittee() != null) {

                committeeIds.add(
                        registration
                                .getCommittee()
                                .getId()
                );
            }
        }


        List<MainAnnouncement> announcements =
                new ArrayList<>();


        /*
         * Global announcements
         */
        announcements.addAll(
                mainAnnouncementRepository
                        .findByCommitteeIdIsNullAndStatusOrderByCreatedAtDesc(
                                MainAnnouncementStatus.PUBLISHED
                        )
                        .stream()
                        .filter(
                                this::isVisibleToDelegate
                        )
                        .toList()
        );


        /*
         * Committee announcements
         */
        for (Long committeeId :
                committeeIds) {

            announcements.addAll(
                    mainAnnouncementRepository
                            .findByCommitteeIdAndStatusOrderByCreatedAtDesc(
                                    committeeId,
                                    MainAnnouncementStatus.PUBLISHED
                            )
                            .stream()
                            .filter(
                                    this::isVisibleToDelegate
                            )
                            .toList()
            );
        }


        return announcements
                .stream()
                .sorted(
                        (a, b) ->
                                b.getCreatedAt()
                                 .compareTo(
                                         a.getCreatedAt()
                                 )
                )
                .map(this::toResponse)
                .toList();
    }


    throw new RuntimeException(
            "Only Admin, Chair and Delegate can view announcements."
    );
}


private boolean isVisibleToChair(
        MainAnnouncement announcement
) {

    return announcement.getAudience() ==
                AnnouncementAudience.CHAIRS_ONLY
            ||
            announcement.getAudience() ==
                AnnouncementAudience.CHAIRS_AND_DELEGATES;
}

private boolean isVisibleToDelegate(
        MainAnnouncement announcement
) {

    return announcement.getAudience() ==
                AnnouncementAudience.DELEGATES_ONLY
            ||
            announcement.getAudience() ==
                AnnouncementAudience.CHAIRS_AND_DELEGATES;
}
    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private MainAnnouncementResponse toResponse(
            MainAnnouncement announcement
    ) {

        return MainAnnouncementResponse.builder()

                .id(
                        announcement.getId()
                )

                .title(
                        announcement.getTitle()
                )

                .content(
                        announcement.getContent()
                )

                .committeeId(
                        announcement.getCommitteeId()
                )

                .committeeName(
                        announcement.getCommitteeName()
                )

                .createdBy(
                        announcement.getCreatedBy()
                )

                .createdByName(
                        announcement.getCreatedByName()
                )

                .status(
                        announcement.getStatus()
                                .name()
                )

                .createdAt(
                        announcement.getCreatedAt()
                )

                .updatedAt(
                        announcement.getUpdatedAt()
                )

                .publishedAt(
                        announcement.getPublishedAt()
                )
                .audience(
                announcement.getAudience()
                )

                .build();
    }

    private User getLoggedInUser() {

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();

    if (authentication == null ||
            !authentication.isAuthenticated()) {

        throw new RuntimeException(
                "User is not authenticated."
        );
    }

    String username =
            authentication.getName();

    return userRepository
            .findByEmail(username)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Logged-in user not found."
                    )
            );
}

private Committee getChairCommittee(User chair) {

    List<Committee> committees =
            committeeRepository.findByChairpersonEmail(
                    chair.getEmail()
            );

    if (committees == null || committees.isEmpty()) {
        throw new RuntimeException(
                "No committee assigned to this chair."
        );
    }

    return committees.get(0);
}

private List<Committee> getChairCommittees(User chair) {

    if (chair == null || chair.getEmail() == null) {
        throw new RuntimeException(
                "Chair email not found."
        );
    }

    List<Committee> committees =
            committeeRepository
                    .findByChairpersonEmail(
                            chair.getEmail()
                    );

    if (
            committees == null ||
            committees.isEmpty()
    ) {
        throw new RuntimeException(
                "No committees found for this chair."
        );
    }

    return committees;
}

private void validateChairOwnership(
        MainAnnouncement announcement,
        User user
) {

    // =====================================================
    // ADMIN
    // =====================================================

    if (user.getRole() == Role.ADMIN) {
        return;
    }


    // =====================================================
    // CHAIR
    // =====================================================

    if (user.getRole() != Role.CHAIR) {

        throw new RuntimeException(
                "Only Admin and Chair can modify announcements."
        );
    }


    List<Committee> chairedCommittees =
            committeeRepository
                    .findByChairpersonEmail(
                            user.getEmail()
                    );


    if (
            chairedCommittees == null ||
            chairedCommittees.isEmpty()
    ) {

        throw new RuntimeException(
                "No committees assigned to this chair."
        );
    }


    boolean ownsCommittee =
            chairedCommittees
                    .stream()
                    .anyMatch(
                            committee ->
                                    committee.getId()
                                            .equals(
                                                    announcement
                                                            .getCommitteeId()
                                            )
                    );


    if (!ownsCommittee) {

        throw new RuntimeException(
                "You are not authorized to modify this announcement."
        );
    }
}   // closes validateChairOwnership


}   // closes MainAnnouncementServiceImpl