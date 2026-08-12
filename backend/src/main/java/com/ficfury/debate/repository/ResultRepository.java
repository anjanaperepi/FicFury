package com.ficfury.debate.repository;

import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResultRepository
        extends JpaRepository<Result, Long> {

    Optional<Result> findBySession(DebateSession session);

}
