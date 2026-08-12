package com.ficfury.repository;

import com.ficfury.model.MainAnnouncement;
import com.ficfury.model.MainAnnouncementStatus;
import com.ficfury.model.AnnouncementAudience;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MainAnnouncementRepository
        extends JpaRepository<MainAnnouncement, Long> {

    List<MainAnnouncement>
    findByCommitteeIdOrderByCreatedAtDesc(
            Long committeeId
    );


    List<MainAnnouncement>
    findByStatusOrderByCreatedAtDesc(
            MainAnnouncementStatus status
    );


    List<MainAnnouncement>
    findByCommitteeIdAndStatusOrderByCreatedAtDesc(
            Long committeeId,
            MainAnnouncementStatus status
    );


    /*
     * Global announcements
     */
    List<MainAnnouncement>
    findByCommitteeIdIsNullAndStatusOrderByCreatedAtDesc(
            MainAnnouncementStatus status
    );


    /*
     * Published announcements for a specific audience.
     */
    List<MainAnnouncement>
    findByAudienceAndStatusOrderByCreatedAtDesc(
            AnnouncementAudience audience,
            MainAnnouncementStatus status
    );


    /*
     * Published announcements for an audience
     * that are either Global OR belong to a committee.
     */
    List<MainAnnouncement>
    findByAudienceAndStatusAndCommitteeIdIsNullOrderByCreatedAtDesc(
            AnnouncementAudience audience,
            MainAnnouncementStatus status
    );


    List<MainAnnouncement>
    findByAudienceAndStatusAndCommitteeIdOrderByCreatedAtDesc(
            AnnouncementAudience audience,
            MainAnnouncementStatus status,
            Long committeeId
    );



}
