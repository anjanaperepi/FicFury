package com.ficfury.service;

import com.ficfury.dto.MainAnnouncementRequest;
import com.ficfury.dto.MainAnnouncementResponse;
import java.util.List;

public interface MainAnnouncementService {

    MainAnnouncementResponse createAnnouncement(
            MainAnnouncementRequest request
    );

    MainAnnouncementResponse updateAnnouncement(
            Long id,
            MainAnnouncementRequest request
    );

    void deleteAnnouncement(Long id);

    MainAnnouncementResponse publishAnnouncement(Long id);

    List<MainAnnouncementResponse> getAllAnnouncements();

    List<MainAnnouncementResponse> getCommitteeAnnouncements(
            Long committeeId
    );

    List<MainAnnouncementResponse> getPublishedAnnouncements();

    List<MainAnnouncementResponse> getMyAnnouncements();

}