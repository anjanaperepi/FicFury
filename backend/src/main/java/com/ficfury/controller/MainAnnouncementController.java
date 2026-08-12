package com.ficfury.controller;

import com.ficfury.dto.MainAnnouncementRequest;
import com.ficfury.dto.MainAnnouncementResponse;
import com.ficfury.service.MainAnnouncementService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin
public class MainAnnouncementController {

    private final MainAnnouncementService announcementService;

    public MainAnnouncementController(
            MainAnnouncementService announcementService
    ) {
        this.announcementService =
                announcementService;
    }


    // =========================================================
    // CREATE
    // ADMIN + CHAIR
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @PostMapping
    public ResponseEntity<MainAnnouncementResponse>
    createAnnouncement(
            @RequestBody MainAnnouncementRequest request
    ) {

        MainAnnouncementResponse response =
                announcementService
                        .createAnnouncement(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // UPDATE
    // ADMIN + CHAIR
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @PutMapping("/{id}")
    public ResponseEntity<MainAnnouncementResponse>
    updateAnnouncement(
            @PathVariable Long id,
            @RequestBody MainAnnouncementRequest request
    ) {

        MainAnnouncementResponse response =
                announcementService
                        .updateAnnouncement(
                                id,
                                request
                        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DELETE
    // ADMIN + CHAIR
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteAnnouncement(
            @PathVariable Long id
    ) {

        announcementService
                .deleteAnnouncement(id);

        return ResponseEntity.noContent()
                .build();
    }


    // =========================================================
    // PUBLISH
    // ADMIN + CHAIR
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'CHAIR')")
    @PutMapping("/{id}/publish")
    public ResponseEntity<MainAnnouncementResponse>
    publishAnnouncement(
            @PathVariable Long id
    ) {

        MainAnnouncementResponse response =
                announcementService
                        .publishAnnouncement(id);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // ADMIN — ALL ANNOUNCEMENTS
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<MainAnnouncementResponse>>
    getAllAnnouncements() {

        return ResponseEntity.ok(
                announcementService
                        .getAllAnnouncements()
        );
    }


    // =========================================================
    // COMMITTEE ANNOUNCEMENTS
    // =========================================================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'CHAIR', 'DELEGATE')"
    )
    @GetMapping("/committee/{committeeId}")
    public ResponseEntity<List<MainAnnouncementResponse>>
    getCommitteeAnnouncements(
            @PathVariable Long committeeId
    ) {

        return ResponseEntity.ok(
                announcementService
                        .getCommitteeAnnouncements(
                                committeeId
                        )
        );
    }


    // =========================================================
    // PUBLISHED ANNOUNCEMENTS
    // DELEGATES + ADMIN + CHAIR
    // =========================================================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'CHAIR', 'DELEGATE')"
    )
    @GetMapping("/published")
    public ResponseEntity<List<MainAnnouncementResponse>>
    getPublishedAnnouncements() {

        return ResponseEntity.ok(
                announcementService
                        .getPublishedAnnouncements()
        );
    }

    @PreAuthorize(
        "hasAnyRole('ADMIN', 'CHAIR', 'DELEGATE')"
)
@GetMapping("/my")
public ResponseEntity<List<MainAnnouncementResponse>>
getMyAnnouncements() {

    return ResponseEntity.ok(
            announcementService
                    .getMyAnnouncements()
    );
}

}