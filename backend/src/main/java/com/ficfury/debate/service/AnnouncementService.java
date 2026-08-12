package com.ficfury.debate.service;

import com.ficfury.debate.dto.request.AnnouncementRequest;
import com.ficfury.debate.dto.response.AnnouncementResponse;

import java.util.List;

public interface AnnouncementService {

    AnnouncementResponse publishAnnouncement(
            AnnouncementRequest request);

    List<AnnouncementResponse> getAnnouncements(
            Long sessionId);

}