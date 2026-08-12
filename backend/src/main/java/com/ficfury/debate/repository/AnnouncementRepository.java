package com.ficfury.debate.repository;

import com.ficfury.debate.entity.Announcement;
import com.ficfury.debate.entity.DebateSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository
        extends JpaRepository<Announcement, Long> {

    List<Announcement> findBySessionOrderByCreatedAtDesc(
            DebateSession session
    );

}
