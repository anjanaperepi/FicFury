package com.ficfury.debate.controller;

import com.ficfury.debate.dto.request.AnnouncementRequest;
import com.ficfury.debate.dto.response.AnnouncementResponse;
import com.ficfury.debate.service.AnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debate/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(
            AnnouncementService announcementService) {

        this.announcementService = announcementService;
    }

    @PostMapping
    public ResponseEntity<AnnouncementResponse> publishAnnouncement(
            @RequestBody AnnouncementRequest request) {

        return ResponseEntity.ok(
                announcementService.publishAnnouncement(request));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                announcementService.getAnnouncements(sessionId));
    }

}