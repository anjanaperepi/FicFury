package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.model.Committee;

public interface CommitteeRepository
        extends JpaRepository<Committee, Long> {

    List<Committee> findByChairpersonEmail(String chairpersonEmail);
    boolean existsByNameIgnoreCase(String name);

}