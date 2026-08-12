package com.ficfury.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "main_announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MainAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = true)
    private Long committeeId;

    @Column(nullable = true)
    private String committeeName;

    @Column(nullable = false)
    private Long createdBy;

    @Column(nullable = false)
    private String createdByName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MainAnnouncementStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementAudience audience;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime publishedAt;
}